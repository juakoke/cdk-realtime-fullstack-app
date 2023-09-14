import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from "@aws-cdk/aws-cognito-identitypool-alpha";
import { Stack, StackProps } from "aws-cdk-lib";
import {
  AccountRecovery,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthenticationStack extends Stack {
  public userPool: UserPool;
  private identityPool: IdentityPool;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.buildResources();
  }

  private buildResources = () => {
    this.userPool = new UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
    });
    this.identityPool = new IdentityPool(this, "IdentityPool", {
      identityPoolName: "identityForUserData",
      allowUnauthenticatedIdentities: true,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: this.userPool,
            userPoolClient,
          }),
        ],
      },
    });
  };
}
