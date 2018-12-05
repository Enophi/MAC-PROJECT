export default interface IConfig {
    name: string;
    port: number;
    env: string;
    version: string;
    neo_user: string;
    neo_pass?: string
    neo_url: string;
}