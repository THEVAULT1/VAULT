const {User}= require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET||"your_jwt_secret_key";
module.exports = {

    authenticate : (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
    
        if (!token) return res.status(401).json({ message: 'Access denied' });
    
        try {
            req.user = jwt.verify(token, SECRET_KEY);
            next();
        } catch {
            res.status(403).json({ message: 'Invalid token' });
        }
    },

    isAdmin: (req, res, next) => {
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    },
    
    getAllUsers: async (req, res) => {
        try {
        const users = await User.findAll();
        res.status(200).json(users);
        } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
    },
    getUserById: async (req, res) => {
        const { id } = req.params;  
        try {
            const user = await User.findByPk(id);       
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.status(200).json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    deleteUser: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            await user.destroy();
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
 
 
    Sign_up: async (req, res) => {
        const { name, email, password, role } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);


            const user = await User.create({ name, email, password: hashedPassword, role });


            res.status(201).json({ message: 'User created successfully', user });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findAll({ where: { email } });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(password, user.password);


            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
            const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    updateUser: async (req, res) => {
        const { id } = req.params;
        // const id = req.user.id;
        const { name, email, password, role, image ,status } = req.body;
        try {
            const user = await User.findByPk(id);
            
            if (!user) return res.status(404).json({ message: 'User not found' });

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
            }
            await user.update({
                name: name || user.name,
                email: email || user.email,
                password: hashedPassword || user.password,
                role: role || user.role,
                image: image || user.image,
                status: status || user.status,
            });

            res.status(200).json({ message: 'User updated successfully', user });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

}