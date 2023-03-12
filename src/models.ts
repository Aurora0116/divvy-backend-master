export enum UserWalletState {
    Init = -1,
    Idle = 0,
    Playing = 1,
    Depositing = 2,
    Withdrawing = 3,
    Funding = 4,
    Refunding = 5,
}

export interface WalletResponseData {
    ID: number,
    CreatdAt: string,
    UpdatedAt: string,
    DeletedAt: string | null,
    Trash: boolean,
    user_id: number,
    wallet_address: string,
    wallet_status: UserWalletState,
    trading_balance: number,
    funding_balance: number,
    wager_amount: number,
}

export interface ConfigResponseData {
    ID: number,
    CreatdAt: string,
    UpdatedAt: string,
    DeletedAt: string | null,
    Trash: boolean,
    max_multiplier: number,
    min_multiplier: number,
    max: number,
    min: number,
    speed_setting: number,
    cooldown_setting: number,
    house_edge: number,
    round: number,
    min_total_wager: number,
}
