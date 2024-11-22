const jwt = require('jsonwebtoken')
const Emodal = require('../modal/LoginSingup')

exports.tokensecure = async (req, res, next) => {
    try {
        // Check if the Authorization header is present
        const token = req.headers.authorization;
        
        if (!token) throw new Error('Attach Token');
        
        // Verify the token using the secret key 'surat'
        const tokenverify = jwt.verify(token, 'surat');
        
        // Find the user based on the ID decoded from the token
        const userverify = await Emodal.findById(tokenverify.id);
        if (!userverify) throw new Error('User not found');

        // Attach the user object to the request for access in other routes
        req.user = {
            id: userverify._id,
            email: userverify.email,  // Add any additional info if necessary
        };

        next();
    } catch (error) {
        // Return an error response with the message
        res.status(401).json({
            status: 'fail',
            message: error.message || 'Authentication failed',
        });
    }
}
