
const getUser = async (req, res) => {
    try {
        const userData=req.user;
        console.log(userData);
        return res.status(200).json({userData})
    } catch (error) {
        console.log(error)
    }
};

module.exports = { getUser };
