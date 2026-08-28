declare const process: {
  env: {
    CONVEX_SITE_URL?: string;
    [key: string]: string | undefined;
  };
};

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
