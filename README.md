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

# Getting Started

### Clone the repository and install dependencies

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/Jantomz/andromeda-ticket-3.git
cd andromeda-ticket-3
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

1. Go to Andromeda Protocol and access the aOS: [Andromeda Operating System](https://app.testnet.andromedaprotocol.io)
2. Import the `.flex` file included in the repository (`Final-Ticket3-App.flex`).
3. The aOS will create a proper Andromeda App for you. Make sure to fill in the minter address with your address.
4. Once the app is created, publish it, then copy all the individual address components into `src/ContractAddresses.jsx` in this repository (including the `OwnerAddress`).
5. After this setup, you can run the app as an admin. You can simply run the app normally using `npm run dev` or `yarn dev`, and it should work with your own contract setup.

## Deployed Version

If you'd like to view a live version of the app, you can access the web version deployed at:

[https://ticket3.jadenzhang.com](https://ticket3.jadenzhang.com)

# Ticket3 Usage Guide

Welcome to Ticket3! Here's a step-by-step guide to help you get started with the app.

## 1. **Connect Your Keplr Wallet**
   - First things first, make sure you've connected your **Keplr Wallet** and that it's set to the **Andromeda Testnet**. You should see the network indicator in the navbar once it's successfully connected. 

## 2. **Initial Setup**
   - The app’s full functionality becomes available only after connecting your wallet. So, make sure you've done that before moving forward.

## 3. **App Stability Warning**
   - Please note that the app is still in development, and while the error handling is thorough, **malicious attack protection** is not yet fully implemented. We’ll get there, but for now, **please use with caution**.
   - Also, keep in mind that the app may take time to load certain features. **Be patient with transaction processing**, as it will update once completed!

## 4. **Browse Events**
   - Head over to the **Events** tab to browse a list of available events.
   - Click on any event to view **more detailed information**.

## 5. **For Admins: Manage Tickets**
   - If you're an **admin**, you can view all the sellable tickets for an event within the event info page. From here, you can send tickets to the marketplace for others to buy.

## 6. **Purchasing Tickets (For Users)**
   - If you're not an admin, you can still purchase tickets. In the event info page, you’ll see an option to **buy tickets**. Click that to view available options for purchase.

## 7. **Events Wallet**
   - In the **Events Wallet** tab, you can view all the tickets you’ve purchased. This is where they’ll be stored for easy access.

## 8. **Proof of Attendance**
   - For admins: You can generate a **QR code** that others can scan to **add Proof of Attendance** to their ticket. This helps track and verify attendees.

## 9. **Ticket3 Shares**
   - Another feature in the app is **Ticket3 Shares**. Once these shares have loaded, you’ll be able to:
     - View how many shares you own.
     - See the distribution of shares.
     - **Purchase more shares** if you wish!

## 10. **Admin Controls: Managing Events & Shares**
   - As an **admin**, there’s one more tab where you can:
     - **Create new events**.
     - **Mint new shares**.
     - **Send shares to the marketplace** (one by one, for control).
     - **Update shares for profit splitting** among shareholders.

   **Important Notes for Admins:**
   - **Shares can only be minted once** for each event at this stage. 
   - When sending tickets or shares to the marketplace, only **one at a time** can be listed. This is intentional to **prevent marketplace flooding** and maintain more control. However, this may be expanded in the future.
   - Remember, **updating shares is crucial for profit splitting**. Once you update the shares, all ticket purchases will be **split among shareholders**.

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
