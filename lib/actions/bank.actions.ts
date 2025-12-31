"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // get each account info from plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        // get institution info from plaid
        const institution = await getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        });

        const account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available!,
          currentBalance: accountData.balances.current!,
          institutionId: institution.institution_id,
          name: accountData.name,
          officialName: accountData.official_name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          sharaebleId: bank.shareableId,
        };

        return account;
      })
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
    try {
        const bank = await getBank({ documentId: appwriteItemId });

        const accountsResponse = await plaidClient.accountsGet({
            access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        const transferTransactionsData = await getTransactionsByBankId({
            bankId: bank.$id,
        });

        const transferTransactions = transferTransactionsData.documents.map(
            (transferData: Transaction) => ({
                id: transferData.$id,
                name: transferData.name!,
                amount: transferData.amount!,
                date: transferData.$createdAt,
                paymentChannel: transferData.channel,
                category: transferData.category,
                type: transferData.senderBankId === bank.$id ? "debit" : "credit",
            })
        );

        const institution = await getInstitution({
            institutionId: accountsResponse.data.item.institution_id!,
        });

        const transactions = await getTransactions({
            accessToken: bank?.accessToken,
        });

        const account = {
            id: accountData.account_id,
            availableBalance: accountData.balances.available!,
            currentBalance: accountData.balances.current!,
            institutionId: institution.institution_id,
            name: accountData.name,
            officialName: accountData.official_name,
            mask: accountData.mask!,
            type: accountData.type as string,
            subtype: accountData.subtype! as string,
            appwriteItemId: bank.$id,
        };

        // PROTECTION ICI : On ajoute "|| []" pour éviter le crash si transactions est null/undefined
        const allTransactions = [...(transactions || []), ...transferTransactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return parseStringify({
            data: account,
            transactions: allTransactions,
        });
    } catch (error) {
        console.error("An error occurred while getting the account:", error);
        return null; // On renvoie null explicitement pour éviter le "undefined"
    }
};
// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions ✓ Ready in 14.8s
//  ○ Compiling / ...
//  ⚠ ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
// Critical dependency: the request of a dependency is an expression
//
// Import trace for requested module:
// ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
// ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/index.js
// ./node_modules/@opentelemetry/instrumentation/build/esm/platform/index.js
// ./node_modules/@opentelemetry/instrumentation/build/esm/index.js
// ./node_modules/@sentry/node/build/cjs/integrations/tracing/postgresjs.js
// ./node_modules/@sentry/node/build/cjs/index.js
// ./node_modules/@sentry/nextjs/build/cjs/index.server.js
// Error: Route "/" used `searchParams.id`. `searchParams` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
//     at Home (app\(root)\page.tsx:10:39)
//    8 | import RecentTransactions from '@/components/RecentTransactions';
//    9 |
// > 10 | const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
//      |                                       ^
//   11 |   const currentPage = Number(page as string) || 1;
//   12 |   const loggedIn = await getLoggedInUser();
//   13 |   const accounts = await getAccounts({
// Error: Route "/" used `searchParams.page`. `searchParams` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
//     at Home (app\(root)\page.tsx:10:43)
//    8 | import RecentTransactions from '@/components/RecentTransactions';
//    9 |
// > 10 | const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
//      |                                           ^
//   11 |   const currentPage = Number(page as string) || 1;
//   12 |   const loggedIn = await getLoggedInUser();
//   13 |   const accounts = await getAccounts({
//  ⚠ ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
// Critical dependency: the request of a dependency is an expression
//
// Import trace for requested module:
// ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
// ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/index.js
// ./node_modules/@opentelemetry/instrumentation/build/esm/platform/index.js
// ./node_modules/@opentelemetry/instrumentation/build/esm/index.js
// ./node_modules/@sentry/node/build/cjs/integrations/tracing/postgresjs.js
// ./node_modules/@sentry/node/build/cjs/index.js
// ./node_modules/@sentry/nextjs/build/cjs/index.server.js
// AppwriteException: Invalid query: Attribute not found in schema: senderBankId
//     at async getTransactionsByBankId (lib\actions\transaction.actions.ts:37:32)
//     at async getAccount (lib\actions\bank.actions.ts:76:42)
//     at async Home (app\(root)\page.tsx:22:19)
//   35 |     const { database } = await createAdminClient();
//   36 |
// > 37 |     const senderTransactions = await database.listDocuments(
//      |                                ^
//   38 |       DATABASE_ID!,
//   39 |       TRANSACTION_COLLECTION_ID!,
//   40 |       [Query.equal('senderBankId', bankId)], {
//   code: 400,
//   type: 'general_query_invalid',
//   response: '{"message":"Invalid query: Attribute not found in schema: senderBankId","code":400,"type":"general_query_invalid","version":"1.8.0"}'
// }
// An error occurred while getting the account: TypeError: Cannot read properties of undefined (reading 'documents')
//     at getAccount (lib\actions\bank.actions.ts:80:63)
//     at async Home (app\(root)\page.tsx:22:19)
//   78 |         });
//   79 |
// > 80 |         const transferTransactions = transferTransactionsData.documents.map(
//      |                                                               ^
//   81 |             (transferData: Transaction) => ({
//   82 |                 id: transferData.$id,
//   83 |                 name: transferData.name!,
// CONTENU COMPLET ACCOUNT: null
// Transactions reçues : []
// {
//   id: '1Zva77nDWMu7qAeZPpBktK7pP7AlmrspJEv1X',
//   availableBalance: 100,
//   currentBalance: 110,
//   institutionId: 'ins_56',
//   name: 'Plaid Checking',
//   officialName: 'Plaid Gold Standard 0% Interest Checking',
//   mask: '0000',
//   type: 'depository',
//   subtype: 'checking',
//   appwriteItemId: '69524b8a002ef0e784d9',
//   sharaebleId: 'MVp2YTc3bkRXTXU3cUFlWlBwQmt0SzdwUDdBbG1yc3BKRXYxWA=='
// }
//  GET / 200 in 39652ms
export const getTransactions = async ({
                                          accessToken,
                                      }: getTransactionsProps) => {
    let hasMore = true;
    let allTransactions: any[] = [];
    let cursor = null;

    try {
        // Si on n'a pas d'accessToken, on s'arrête de suite
        if (!accessToken) return [];

        while (hasMore) {
            const response = await plaidClient.transactionsSync({
                access_token: accessToken,
                cursor: cursor,
            });

            const data = response.data;

            const newTransactions = data.added.map((transaction) => ({
                id: transaction.transaction_id,
                name: transaction.name,
                paymentChannel: transaction.payment_channel,
                type: transaction.payment_channel,
                accountId: transaction.account_id,
                amount: transaction.amount,
                pending: transaction.pending,
                category: transaction.category ? transaction.category[0] : "",
                date: transaction.date,
                image: transaction.logo_url,
            }));

            allTransactions = [...allTransactions, ...newTransactions];
            hasMore = data.has_more;
            cursor = data.next_cursor;
        }

        return parseStringify(allTransactions);
    } catch (error: any) {
        // CE LOG EST CRUCIAL : regarde ton terminal VS Code pour ce message
        console.error("DÉTAIL ERREUR PLAID TRANSACTIONS:", error?.response?.data || error.message);
        return []; // On renvoie un tableau vide au lieu de faire crasher tout getAccount
    }
};