import { lambdaCommonProps } from "./../services/config/props";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, SchemaFile } from "aws-cdk-lib/aws-appsync";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
  AmazonLinuxEdition,
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  AmazonLinuxStorage,
  AmazonLinuxVirt,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  InterfaceVpcEndpointAwsService,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { join } from "path";

interface Props extends StackProps {
  userPool: UserPool;
}

export class BackendStack extends Stack {
  private vpc: Vpc;
  private dbCredentialSecret: Secret;
  private database: DatabaseInstance;
  private bastionHost: Instance;
  private api: GraphqlApi;
  private lambdaFunctions: NodejsFunction[] = [];
  private bastionSg: SecurityGroup;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    this.buildVpc();
    this.buildDatabase();
    this.buildBastion();
    this.buildApi(props);
    this.buildResolvers();
    this.setPermissionsToLambdas();
  }

  private buildVpc = () => {
    this.vpc = new Vpc(this, "dbVPC", {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "public",
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: "private",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Not in Free Tier! 0.01 USD hourly, 8usd monthly in ohio
    this.vpc.addInterfaceEndpoint("SecreteManagerVpcEndpoint", {
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      privateDnsEnabled: true,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    });
  };

  private buildDatabase = () => {
    this.dbCredentialSecret = new Secret(this, "dbCredentialSecret", {
      secretName: "rdsDatabaseCredentials",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: "fullstackAppUser",
        }),
        excludePunctuation: true,
        generateStringKey: "password",
      },
    });
    this.database = new DatabaseInstance(this, `database`, {
      vpc: this.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      credentials: Credentials.fromSecret(this.dbCredentialSecret),
      port: 5432,
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_15_3,
      }),
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      databaseName: "fullstackAppDatabase",
      backupRetention: Duration.days(1),
      deleteAutomatedBackups: true,
    });
  };
  private buildBastion = () => {
    this.bastionSg = new SecurityGroup(this, "bastionSg", {
      vpc: this.vpc,
      allowAllOutbound: true,
    });
    this.bastionSg.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    // To allow local connections by ssh
    // Be sure to have created a ssh key on AWS console called "miKey"
    this.bastionHost = new Instance(this, "rdsBastion", {
      instanceType: new InstanceType("t3.micro"),
      machineImage: new AmazonLinuxImage({
        edition: AmazonLinuxEdition.STANDARD,
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
        virtualization: AmazonLinuxVirt.HVM,
        storage: AmazonLinuxStorage.GENERAL_PURPOSE,
      }),
      keyName: "miKey",
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      securityGroup: this.bastionSg,
    });
    this.database.connections.allowFrom(this.bastionHost, Port.tcp(5432));
  };
  private buildApi = ({ userPool }: Props) => {
    this.api = new GraphqlApi(this, "API", {
      name: "AppsyncWithLambdaResolverApi",
      schema: SchemaFile.fromAsset(join(__dirname, "schema.graphql")),
      xrayEnabled: true,
      logConfig: {
        excludeVerboseContent: false,
        fieldLogLevel: FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.API_KEY,
          },
        ],
      },
    });
  };

  private buildResolvers = () => {
    const getTodo = this.buildResolver("Query", "getTodo");
    const getTodos = this.buildResolver("Query", "getTodos");
    const createTodo = this.buildResolver("Mutation", "createTodo");
  };

  private buildResolver = (typeName: "Query" | "Mutation", fieldName: "getTodo" | "getTodos" | "createTodo") => {
    const lambdaFn = new NodejsFunction(this, `${fieldName}Function`, {
      ...lambdaCommonProps,
      functionName: `${fieldName}Function`,
      entry: join(__dirname, "..", "services", `${fieldName}.ts`),
      vpc: this.vpc,
      environment: {
        DB_SECRET_ARN: this.database.secret?.secretFullArn || "",
      },
    });

    const apiDatasource = this.api.addLambdaDataSource(`${fieldName}ApiDatasource`, lambdaFn);

    apiDatasource.createResolver(`${fieldName}ResolverId`, {
      typeName,
      fieldName,
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });
    this.lambdaFunctions.push(lambdaFn);
  };

  private setPermissionsToLambdas = () => {
    this.lambdaFunctions.forEach((lambdaFn) => {
      this.database.connections.allowFrom(lambdaFn, Port.tcp(5432));
      this.dbCredentialSecret.grantRead(lambdaFn);
    });
  };
}
