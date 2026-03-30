export default async function handler(req, res) {
    const { GITHUB_TOKEN, GITHUB_REPO, YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY } = process.env;

    res.status(200).json({
        github: {
            token_set: !!GITHUB_TOKEN,
            repo_set: !!GITHUB_REPO,
            repo_name: GITHUB_REPO || 'не задано'
        },
        yookassa: {
            shop_id_set: !!YOOKASSA_SHOP_ID,
            secret_key_set: !!YOOKASSA_SECRET_KEY
        },
        env: process.env.NODE_ENV || 'unknown',
        time: new Date().toISOString()
    });
}
