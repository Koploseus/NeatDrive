import { Commands, Container, Contracts, Services, Utils } from "@arkecosystem/core-cli";
import { Networks } from "@arkecosystem/crypto";
import Joi from "@hapi/joi";
import { Container as KernelContainer, Contracts as KernelContracts } from "@arkecosystem/core-kernel";

/**
 * @export
 * @class Command
 * @extends {Commands.Command}
 */
@Container.injectable()
export class Command extends Commands.Command {
    @Container.inject(Container.Identifiers.Logger)
    private readonly logger!: Services.Logger;

    /**
     * The console command signature.
     *
     * @type {string}
     * @memberof Command
     */
    public signature: string = "snapshot:rollback";

    /**
     * The console command description.
     *
     * @type {string}
     * @memberof Command
     */
    public description: string = "Rollback chain to specified height.";

    /**
     * Configure the console command.
     *
     * @returns {void}
     * @memberof Command
     */
    public configure(): void {
        this.definition
            .setFlag("token", "The name of the token.", Joi.string().default("ark"))
            .setFlag("network", "The name of the network.", Joi.string().valid(...Object.keys(Networks)))
            .setFlag("skipCompression", "Skip gzip compression.", Joi.boolean())
            .setFlag("trace", "Dumps generated queries and settings to console.", Joi.boolean())
            .setFlag("height", "The height after the roll back.", Joi.number())
            .setFlag("number", "The number of blocks to roll back.", Joi.number())
            .setFlag("export", "Export the rolled back transactions.", Joi.boolean().default(true));
    }

    /**
     * Execute the console command.
     *
     * @returns {Promise<void>}
     * @memberof Command
     */
    public async execute(): Promise<void> {
        // this.components.fatal("This command has not been implemented.");
        // TODO: abort running processes (core, forger, relay)

        this.logger.log("Running truncate method from CLI");

        const flags: Contracts.AnyObject = { ...this.getFlags() };
        flags.processType = "snapshot";

        let app = await Utils.buildApplication({
            flags,
            // plugins: {
            //     "@arkecosystem/core-logger-pino": {},
            //     "@arkecosystem/core-state": {},
            //     "@arkecosystem/core-database": {},
            //     "@arkecosystem/core-transactions": {},
            //     "@arkecosystem/core-transaction-pool": {},
            //     "@arkecosystem/core-snapshots": {},
            // },
        });


        if(!app.isBooted()) {
            this.logger.error("App is not booted.");
            return;
        }

        if(!app.isBound(KernelContainer.Identifiers.DatabaseService)) {
            this.logger.error("Database service is not initialized.");
            return;
        }

        if(!app.isBound(KernelContainer.Identifiers.SnapshotService)) {
            this.logger.error("Snapshot service is not initialized.");
            return;
        }

        this.logger.log(JSON.stringify(app.isBound(KernelContainer.Identifiers.SnapshotService)));

        if (flags.height) {
            await app.get<KernelContracts.Snapshot.SnapshotService>(KernelContainer.Identifiers.SnapshotService).rollbackByHeight(flags.height, flags.export);
        } else if (flags.number) {
            await app.get<KernelContracts.Snapshot.SnapshotService>(KernelContainer.Identifiers.SnapshotService).rollbackByNumber(flags.number, flags.export);
        } else {
            this.logger.error("Please specify either a height or number of blocks to roll back.");
        }

        this.logger.log("Finish running truncate method from CLI");
    }
}
