import { PublicKey, Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import {
    ENV as ChainID,
} from "@solana/spl-token-registry";
const { struct, u8, blob, nu64, u16, u32 } = require("buffer-layout");
import path from "path";
import fs from "fs";
const mysql2 = require('mysql2/promise');

// Solana Cluster
export const cluster = "devnet";

export enum ENV {
    Mainnet = "mainnet-beta",
    Testnet = "testnet",
    Devnet = "devnet",
    Localnet = "localnet"
}
export const ENDPOINTS = [
    {
        name: ENV.Mainnet,
        endpoint: "https://solana-api.projectserum.com/",
        chainID: ChainID.MainnetBeta,
    },
    {
        name: ENV.Testnet,
        endpoint: clusterApiUrl(ENV.Testnet),
        chainID: ChainID.Testnet,
    },
    {
        name: ENV.Devnet,
        endpoint: clusterApiUrl(ENV.Devnet),
        chainID: ChainID.Devnet,
    },
    {
        name: ENV.Localnet,
        endpoint: "http://127.0.0.1:8899",
        chainID: ChainID.Devnet,
    },
];


// MySQL exports
export const connect = async () => {
    const mysqlconnection = await mysql2.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME
    });
    return mysqlconnection
};
export const end = async (mysqlconnection: any) => {
    mysqlconnection.end()
}

export const BUST_STATE_ACCOUNT_DATA_LAYOUT = struct([
    blob(1, "isInitialized"),
    blob(4, "currentMultiplier"),
    blob(4, "previousMultiplier"),
])


// Bet Pool PubKeys
export const BET_POOL_PROGRAM_ID = new PublicKey("2u9dGXkuj5iTm6B9MRn1Exx55uEYX1ZmM3xda5S3f1oY");
export const BET_POOL_STATE_ACCOUNT = new PublicKey("61HRTaAmQjNLdaAUG4E1YfTjBrtfZX7dtDsyHdTeSuTz");
export const BET_POOL_PDA_ACCOUNT = new PublicKey("PkimpSks8R9KLHsTAupcHyBgYDitaE2PXk697urr3xP");
export const BET_POOL_USDT_ACCOUNT = new PublicKey("FCBywWm9JBrnLpKyBySYVbVhFVHMsHb1abPoyQjxAVm7");

// Game Keys
export const BUST_ACCOUNT = new PublicKey("AqBHPn8WB9aE6guF33E2KxiigBB9Sm4QuTq8NH5w1xi5");
export const MOONSHOT_HOUSE_ACCOUNT = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("./moonshot.json"), 'utf-8'))), { skipValidation: true });

// House Pool PubKeys
export const HOUSE_POOL_PROGRAM_ID = new PublicKey("FatTSDYddftPGBVCoV6Uu2aCiMg8B8ZxV3QuoxE2PK6U");
export const HOUSE_POOL_STATE_ACCOUNT = new PublicKey("8miu9HZwCWXCtrG8FfVatkEkdDumwtagRXgnarqeN8VJ");
export const HOUSE_POOL_PDA_ACCOUNT = new PublicKey("CrCJYSbgSFa6ZE3KviaTSnmGhhBw2t3auYro2N36irH5");
export const HOUSE_POOL_USDT_ACCOUNT = new PublicKey("7pEFUa15WfunEPWJoaQVpxPWm7pvwqiDjmpizBKvXnog");
// Other PubKeys
export const USDT_DEVNET_MINT = new PublicKey("7cnY6yuFXzTLEsnXn4FkgvmXq4FyuUakQDQqHJkbQvYG");
export const SWITCHBOARD_PID = new PublicKey("7azgmy1pFXHikv36q1zZASvFq5vFa39TT9NweVugKKTU");
export const PAYER_ACCOUNT = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("./divvy.json"), 'utf-8'))), { skipValidation: true });
export const FULFILLMENT_ACCOUNT = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("./fulfill.json"), 'utf-8'))), { skipValidation: true });
export const VRF_ACCOUNT = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("./vrf.json"), 'utf-8'))), { skipValidation: true });
export const VRF_PRODUCER_ACCOUNT = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("./vrfPermit.json"), 'utf-8'))), { skipValidation: true });
export const FM_PERMIT_ACCOUNT = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("./fmPermit.json"), 'utf-8'))), { skipValidation: true })
export const INSURANCE_FUND_USDT = new PublicKey("49LjYdPT6J3qxetSHJVdSStjcPx6bB7ZSPuMfUazzR1B");
export const FOUNDATION_USDT = new PublicKey("3GdEv44vcayV8x3F9Zn9WrTSP7jTrQx6eFX4byvWtrVz");

// Connection
export const connection = new Connection(ENDPOINTS[2].endpoint, 'processed');

// General layout
export const GENERAL_LAYOUT = struct([
    u8("action"),
    u32(4, "multiplier")
]);

// Market State Enum
export enum MARKET_STATE {
    TEAM_A_WON = 0,
    TEAM_B_WON = 1,
    DRAW = 2,
    NOT_COMMENCED = 3,
    COMMENCED = 4,
    SETTLED = 5
}

// Moneyline Market Commence Layouts and allocs
export const MARKET_COMMENCE_DATA_BUFFER = Buffer.alloc(GENERAL_LAYOUT.span);

// Moneyline Market State Layout

export const MARKET_STATE_ACCOUNT_DATA_LAYOUT = struct([
    blob(1, "isInitialized"),
    blob(246, "marketSides"),
    blob(8, "lockedLiquidity"),
    blob(32, "resultFeed"),
    u8("result"),
    blob(8, "bettorBalance"),
    blob(8, "pendingBets"),
    blob(2, "teamAScore"),
    blob(2, "teamBScore"),
    blob(2, "totalScore"),
]);

export const BET_LAYOUT = struct([
    u8('isInitialized'),
    blob(32,'market'),
    blob(32,'userUsdtAccount'),
    blob(32,'userAccount'),
    nu64('risk'),
    nu64('payout'),
    u16('points'),
    u8('marketSide'),
    u8('outcome'),
    u8('betType')
  ]);

export const MULTIPLIER_ACCOUNT_DATA_LAYOUT = struct([
    u32('multiplier'),
    u8('busted'),
    nu64('counter')
])
  
export const INIT_BUST_DATA_BUFFER = Buffer.alloc(GENERAL_LAYOUT.span);
