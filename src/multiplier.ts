import { Account, Connection, PublicKey } from "@solana/web3.js";
import { parseVrfAccountData, requestRandomness } from "@switchboard-xyz/switchboard-api";
import keccak256 from "keccak256";
import { addMultiplierOnchain } from "./addMultiplierOnChain";
// import { setRedisInfo } from "./api";
import { connection, FM_PERMIT_ACCOUNT, PAYER_ACCOUNT, VRF_ACCOUNT, VRF_PRODUCER_ACCOUNT } from "./constants/ids";
import { sleep, getDuration, MIN, MAX, HOUSE_EDGE, DECIMAL, SPEED_SETTING, COOLDOWN_SETTING, calcBust, updateConfigFromDB, subscriber, redisClient, publisher } from './constants/utils';
import { saveDump } from "./dump";

let START_TIME = 0;
let MULTIPLIER;
let DURATION = 0;
let pubkey = new PublicKey("4AUbphW9KziRRq8Diq3SpYac5cjPbcenyTWpgyyZALHN");

// Test route for /fetchRandom
export const routeFetchRandom = async (req, res) => {
  console.log("Generating randomness...")
  await requestRandomness(connection, new Account(PAYER_ACCOUNT.secretKey), new Account(VRF_ACCOUNT.secretKey), VRF_PRODUCER_ACCOUNT.publicKey, FM_PERMIT_ACCOUNT.publicKey)
  console.log("Awaiting randomness...");
  await awaitRandomness(connection, new Account(VRF_ACCOUNT.secretKey));
  let state = await parseVrfAccountData(connection, VRF_ACCOUNT.publicKey);
  let data = state.toJSON();
  console.log(parseInt(keccak256(data.msg).toString('hex'), 16) / 10**75)
  res.send("Working on it :)");
}

// Redis subscriber for new game
subscriber.on("message", async (channel, message) => {
  console.log('-----');
  console.log(message);
  const duration = JSON.parse(message)["duration"];
  
  // Generating next multiplier
  let game_data = await generateMultiplier();
  while (!game_data) {
    await sleep(3000);
    game_data = await generateMultiplier();
  }
  const delay = Date.now() - game_data.start_time - 1000;
  console.log('generated the next game data. consumed ', delay);
  setTimeout(() => {
    // Broadcast generated data to redis subscribers
    redisClient.set("game-data", JSON.stringify(game_data))
    // setRedisInfo("game-data", game_data);
    publisher.publish("new-game", JSON.stringify(game_data))
  }, (duration + COOLDOWN_SETTING) * 1000 - delay);
})

export const startGenerating = async () => {
  let game_data = await generateMultiplier();
  while (!game_data) {
    await sleep(3000);
    game_data = await generateMultiplier();
  }
  const delay = Date.now() - game_data.start_time;
  setTimeout(() => {
    // setRedisInfo("game-data", game_data);
    redisClient.set("game-data", JSON.stringify(game_data))
    publisher.publish("new-game", JSON.stringify(game_data))
  }, COOLDOWN_SETTING * 1000 - delay);
};


export async function awaitRandomness(connection: Connection, vrfAccount: Account) {
    let attempts = 1;
    while (attempts--) {
        let state = await parseVrfAccountData(connection, vrfAccount.publicKey);
        if (state.numProofConfirmations >= state.minProofConfirmations) {
            break;
        }
        await sleep(1_000);
    }
}

export const generateMultiplier = async () => {
  try {
  console.log("sending data");
  console.log("Generating randomness...")
  START_TIME = Date.now();
  console.log(START_TIME);

  // try {
  //   // Airdrop for devnet env. Should ignore for main env
  //   connection.requestAirdrop(PAYER_ACCOUNT.publicKey, 1000000000)
  // } catch (e) {
  //   console.log(e);
  // };

  await requestRandomness(connection, new Account(PAYER_ACCOUNT.secretKey), new Account(VRF_ACCOUNT.secretKey), VRF_PRODUCER_ACCOUNT.publicKey, FM_PERMIT_ACCOUNT.publicKey)
  console.log("Awaiting randomness...");
  await awaitRandomness(connection, new Account(VRF_ACCOUNT.secretKey));
  let state = await parseVrfAccountData(connection, VRF_ACCOUNT.publicKey);
  let data = state.toJSON();
  const randStr = keccak256(data.msg).toString('hex');
  await updateConfigFromDB();
  const randNum = parseInt(randStr, 16) / 10**75;
  MULTIPLIER = calcBust(randNum);
  pubkey = await addMultiplierOnchain(MULTIPLIER * 100, pubkey);
  DURATION = getDuration(MULTIPLIER);
  DURATION = DURATION > 0 ? DURATION : 1;
  saveDump('/dumps/output.json', {
    randStr,
    randNum,
    min: MIN,
    max: MAX,
    multiplier: parseFloat(MULTIPLIER),
    hash: pubkey.toBase58(),
    time: (new Date()).toLocaleString(),
  });

  const CONFIG = {
    MAX,
    MIN,
    HOUSE_EDGE,
    DECIMAL,
    SPEED_SETTING,
    COOLDOWN_SETTING,
  }

  const game_data = { "pubkey": pubkey.toBase58(), "multiplier": MULTIPLIER, "start_time": START_TIME, "duration": DURATION, "config": CONFIG };
  return game_data;
} catch (e) {
  return undefined;
}
}
