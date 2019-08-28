import { Identities } from "@arkecosystem/crypto";
import * as support from "../../../../__tests__/functional/transaction-forging/__support__";
import { secrets } from "../../../../__tests__/utils/config/testnet/delegates.json";
import { MarketplaceTransactionFactory } from "./helper";

const { passphrase } = support.passphrases;

beforeAll(support.setUp);
afterAll(support.tearDown);

describe("Transaction Forging - Bridgechain update", () => {
    let transactionId;
    it("should broadcast, accept and forge it ", async () => {
        // Initial Funds
        const initialFunds = MarketplaceTransactionFactory.transfer(
            Identities.Address.fromPassphrase(passphrase),
            100 * 1e8,
        )
            .withPassphrase(secrets[0])
            .createOne();

        await expect(initialFunds).toBeAccepted();
        await support.snoozeForBlock(1);
        await expect(initialFunds.id).toBeForged();

        // Registering a business
        const businessRegistration = MarketplaceTransactionFactory.businessRegistration({
            name: "google",
            website: "www.google.com",
        })
            .withPassphrase(secrets[0])
            .createOne();

        await expect(businessRegistration).toBeAccepted();
        await support.snoozeForBlock(1);
        await expect(businessRegistration.id).toBeForged();

        // Registering a bridgechain
        const bridgechainRegistration = MarketplaceTransactionFactory.bridgechainRegistration({
            name: "cryptoProject",
            seedNodes: ["1.2.3.4", "2001:0db8:85a3:0000:0000:8a2e:0370:7334"],
            genesisHash: "127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935",
            bridgechainRepository: "www.organizationRepository.com/myorg/myrepo",
        })
            .withPassphrase(secrets[0])
            .createOne();

        transactionId = bridgechainRegistration.id;
        await expect(bridgechainRegistration).toBeAccepted();
        await support.snoozeForBlock(1);
        await expect(transactionId).toBeForged();

        // Updating a bridgechain
        const bridgechianUpdate = MarketplaceTransactionFactory.bridgechainUpdate({
            registeredBridgechainId: transactionId,
            seedNodes: ["1.2.3.4", "127.0.0.1", "192.168.1.0", "131.107.0.89"],
        })
            .withPassphrase(secrets[0])
            .createOne();

        await expect(bridgechianUpdate).toBeAccepted();
        await support.snoozeForBlock(1);
        await expect(bridgechianUpdate.id).toBeForged();
    });

    it("should ", async () => {
        // Bridgechain resignation
        const bridgechainResignation = MarketplaceTransactionFactory.bridgechainResignation(transactionId)
            .withPassphrase(secrets[0])
            .createOne();
        await expect(bridgechainResignation).toBeAccepted();
        await support.snoozeForBlock(1);
        await expect(bridgechainResignation.id).toBeForged();

        // Updating a bridgechain
        const bridgechianUpdate = MarketplaceTransactionFactory.bridgechainUpdate({
            registeredBridgechainId: transactionId,
            seedNodes: ["1.2.3.4", "127.0.0.1", "192.168.1.0", "131.107.0.89"],
        })
            .withPassphrase(secrets[0])
            .createOne();

        expect(bridgechianUpdate).toBeRejected();
        await support.snoozeForBlock(1);
        await expect(bridgechianUpdate.id).not.toBeForged();
    });
});