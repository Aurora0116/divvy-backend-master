import { routeDeposit, routeRegister, routeWithdraw } from "./api";
import { routeFetchRandom } from "./multiplier";

export const initRoute = (app) => {
    app.get('/', (req, res) => {
        res.send('<h1>Weclome to divvy</h1>');
    });
      
    app.get('/fetchRandom', routeFetchRandom);
    app.post('/register', routeRegister);
    app.post('/deposit', routeDeposit);
    app.post('/withdraw', routeWithdraw);
}