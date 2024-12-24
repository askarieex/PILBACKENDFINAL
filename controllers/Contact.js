const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate the input data
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Create a new contact entry
        const newContact = new Contact({
            name,
            email,
            subject,
            message,
        });

        // Save to database
        await newContact.save();

        res.status(201).json({ message: "Contact data saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
