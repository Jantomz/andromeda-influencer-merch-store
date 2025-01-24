<p>&nbsp;</p>
<p align="center">
<img src="https://github.com/andromedaprotocol/andromeda-nextjs-application-starter/blob/main/public/Andromeda-Logo.png" width=1000>
</p>

# This project was bootstrapped with the Andromeda Next.js Application Starter

## About
The Andromeda Next.js Application Starter is a base setup for developers to start building without having to worry about the prerequisites. Containing all the key parts needed, it allows you to set up in minutes and start working on your builds. The starter contains the following setups:
- Keplr integration
- Andromeda Client (Devnet)
- GraphQL integration
- Contract execution hooks 

Using this as a starting template, any developer can create their own Next.js application with custom embeddables that suit their needs.

**Notes**:
- It mainly uses Chakra UI, but developers can install any styling library, such as Tailwind, for example.
- This setup is currently using our Devnet (Testnet for Devs). If you encounter any issues connecting to the GraphQL or chain, please contact us for support.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Clone the repository and install dependencies

To get started, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-folder>
npm install
# or
yarn install
```
# Set up environment variables

You need to set up your environment variables to configure the application properly.

1. **Create a `.local.env` file** in the root of the project and set up your MongoDB cluster. You can follow these steps to create a MongoDB cluster:

    1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
    2. Create a new project, then a new cluster.
    3. Under the "Connect" tab, choose "Connect your application" and copy the connection string (it will look something like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).
    4. Paste the connection string in your `.local.env` file, and replace the placeholders `<username>` and `<password>` with your MongoDB credentials.

    **Example:**

    ```bash
    MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase"
    MONGODB_DB="your-database-name"
    ```

2. **Create a `.env` file** and add the following configuration. Make sure to update the values accordingly.

    ```bash
    # Andromeda Dev GQL Endpoint. It can change with time, so please contact the Andromeda team if the URL is not working
    NEXT_PUBLIC_GRAPHQL_ENDPOINT='https://api.andromedaprotocol.io/graphql/testnet'

    # Andromeda Devnet Chain Id. Change this to connect to a different chain
    NEXT_PUBLIC_CHAIN_ID='galileo-4'
    ```

# Running the Application

Once your environment variables are set up, you can run the development server:

```bash
npm run dev
# or
yarn dev
```

# The app will be available at [http://localhost:3000](http://localhost:3000).

## Running with Your Own Contracts

If you want to run the application using your own contracts and set yourself as the admin, follow these steps:

1. Go to Andromeda Protocol and access the aOS (Andromeda Operating System).
2. Import the `.flex` file included in the repository (`Final-Ticket3-App.flex`).
3. The aOS will create a proper Andromeda App for you. Make sure to fill in the minter address with your address.
4. Once the app is created, publish it, then copy all the individual address components into `src/ContractAddresses.jsx` in this repository.
5. After this setup, you don't need to run the app as an admin every time. You can simply run the app normally using `npm run dev` or `yarn dev`, and it should work with your own contract setup.

## Deployed Version

If you'd like to view a live version of the app, you can access the web version deployed at:

[https://ticket3.jadenzhang.com](https://ticket3.jadenzhang.com)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.
- You can also check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Licensing

- [Terms and Conditions](#)
