export default (req, res, next) => {
    let admin = req.admin
    if(admin === undefined){
        console.log('Error at adminMiddleware. This middleware should be used after authMiddleware')
        return res.status(403).send({ error: 'User is not admin. Type 2'})
    }
    if(!admin){
        return res.status(403).send({ error: 'User is not admin'})
    }
    next()
};