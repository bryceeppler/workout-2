import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
      <Toaster 
      toastOptions={{
        className: '',
        style: {
          color: 'white',
          background: '#44403c',
          border: '1px solid #8b5cf6',

        },
      }}
      />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
