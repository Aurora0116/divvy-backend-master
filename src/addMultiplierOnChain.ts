import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { GENERAL_LAYOUT, MULTIPLIER_ACCOUNT_DATA_LAYOUT, INIT_BUST_DATA_BUFFER, BET_POOL_PROGRAM_ID, PAYER_ACCOUNT, connection, BUST_ACCOUNT, MOONSHOT_HOUSE_ACCOUNT } from "./constants/ids";

export const addMultiplierOnchain = async (multiplier: Number, PREVIOUS_ACCOUNT: PublicKey) => {
    console.log(multiplier)
    const INIT_BUST_LAYOUT_DATA = {
        action: 9,
        multiplier: multiplier
    }

    GENERAL_LAYOUT.encode(INIT_BUST_LAYOUT_DATA, INIT_BUST_DATA_BUFFER);

    const MULTIPLIER_ACCOUNT = Keypair.generate();
    const market_state = await SystemProgram.createAccount({
        space: MULTIPLIER_ACCOUNT_DATA_LAYOUT.span,
        lamports: await connection.getMinimumBalanceForRentExemption(MULTIPLIER_ACCOUNT_DATA_LAYOUT.span, 'singleGossip'),
        fromPubkey: PAYER_ACCOUNT.publicKey,
        newAccountPubkey: MULTIPLIER_ACCOUNT.publicKey,
        programId: BET_POOL_PROGRAM_ID
    });
    console.log(MULTIPLIER_ACCOUNT.publicKey.toString())
    const initMarketInstruction = new TransactionInstruction({
        keys: [
            { pubkey: PAYER_ACCOUNT.publicKey, isSigner: true, isWritable: true },
            { pubkey: BUST_ACCOUNT, isSigner: false, isWritable: true },
            { pubkey: MULTIPLIER_ACCOUNT.publicKey, isSigner: false, isWritable: true },
            { pubkey: PREVIOUS_ACCOUNT, isSigner: false, isWritable: true },
        ],
        programId: BET_POOL_PROGRAM_ID,
        data: INIT_BUST_DATA_BUFFER,
    });
    console.log("Awaiting transaction confirmation...");

    let signature = await sendAndConfirmTransaction(connection,
        new Transaction().add(market_state).add(initMarketInstruction), [PAYER_ACCOUNT, MULTIPLIER_ACCOUNT]);

    return MULTIPLIER_ACCOUNT.publicKey;
}

export const transferWithdrawal = async (address: string, amount: number) => {
    console.log(`  Transfer ${amount} SOL for withdrawal to ${address}`);
    const recipient = new PublicKey(address);
    const withdrawal = await SystemProgram.transfer({
        lamports: amount * LAMPORTS_PER_SOL,
        fromPubkey: MOONSHOT_HOUSE_ACCOUNT.publicKey,
        toPubkey: recipient,
    });
    console.log(MOONSHOT_HOUSE_ACCOUNT.publicKey.toString())
    console.log("Awaiting transaction confirmation...");

    let signature = await sendAndConfirmTransaction(connection,
        new Transaction().add(withdrawal), [MOONSHOT_HOUSE_ACCOUNT]);
    console.log(signature);
    
    return {result: signature};
}