import redis from 'redis';
import { getConfigFromDB, updateDBConfig } from "../api";
import { ConfigResponseData } from '../models';
import { REDIS_CONFIG } from "./config";

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export let MAX = 115.79, MIN = 0.05;
export let SPEED_SETTING = 20;
export let COOLDOWN_SETTING = 20;
export let HOUSE_EDGE = .01;
export let DECIMAL = 2;

export const updateValidRange = (min: number, max: number) => {
    MIN = min;
    MAX = max;
    updateDBConfig(min, max);
}

/**
 * Calculate bust multiplier from the generated rand number
 * @param value generated rand number
 * @returns calculated multiplier
 */
export const calcBust = (value: number): number => {
    const randNum = value;//parseFloat(value.toFixed(DECIMAL));
    if (MIN > randNum || MAX < randNum) {
        updateValidRange(MIN > randNum ? randNum : MIN, MAX < randNum ? randNum : MAX );
    }

    let bust = (1 - HOUSE_EDGE) * (MAX - MIN) / (MAX - value);
    return parseFloat(bust.toFixed(DECIMAL));
}

/**
 * Fetch config data from DB for each bust calculation
 */
export const updateConfigFromDB = async () => {
    console.log('Reqeust config data from DB');
    const configInfo: ConfigResponseData | undefined = await getConfigFromDB();
    if (!configInfo) return;
    MAX = configInfo.max;
    MIN = configInfo.min;
    SPEED_SETTING = configInfo.speed_setting;
    COOLDOWN_SETTING = configInfo.cooldown_setting;
    HOUSE_EDGE = configInfo.house_edge;
    DECIMAL = configInfo.round;
}

export const getDuration = (x: number) => {
    x = (1 - (1 - HOUSE_EDGE) / x) * SPEED_SETTING;
    return Math.ceil(x);
}

export const publisher = redis.createClient(REDIS_CONFIG);
export const subscriber = redis.createClient(REDIS_CONFIG);
export const redisClient = redis.createClient(REDIS_CONFIG);