"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Amplify } from "aws-amplify";
import awsConfig from "../../aws-exports";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator, Button } from "@aws-amplify/ui-react";
import { Box, Drawer, Typography } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

Amplify.configure({ ...awsConfig, ssr: true });

const drawerWidth = 256;
function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body className={inter.className}>
        <Authenticator loginMechanisms={["email"]}>
          {({ signOut, user }) => (
            <>
              <Drawer
                variant="permanent"
                anchor="left"
                sx={{
                  width: `${drawerWidth}px`,
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: `${drawerWidth}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  flexShrink: 0,
                }}
              >
                <Typography>{user?.username}</Typography>
                <Button style={{ width: "100%" }} onClick={signOut}>
                  SignOut
                </Button>
              </Drawer>
              <Box
                sx={{
                  paddingLeft: `${drawerWidth}px`,
                }}
              >
                {children}
              </Box>
            </>
          )}
        </Authenticator>
      </body>
    </html>
  );
}
export default RootLayout;
