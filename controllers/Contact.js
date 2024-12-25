// controllers/contactController.js

const Contact = require('../models/Contact');

/**
 * Create a new contact entry.
 * @route POST /api/contacts
 * @access Public
 */
exports.createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate the input data
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: "All fields are required." });
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

        res.status(201).json({ success: true, message: "Contact data saved successfully." });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ success: false, error: "Internal Server Error." });
    }
};

/**
 * Retrieve all contact entries.
 * @route GET /api/contacts
 * @access Private (Requires Authentication)
 */
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }); // Latest first

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts,
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, error: "Internal Server Error." });
    }
};

/**
 * Delete a specific contact entry by ID.
 * @route DELETE /api/contacts/:id
 * @access Private (Requires Authentication)
 */
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ success: false, error: "Contact not found." });
        }

        // Use deleteOne() instead of remove()
        await Contact.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, message: "Contact deleted successfully." });
    } catch (error) {
        console.error('Error deleting contact:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: "Invalid Contact ID." });
        }
        res.status(500).json({ success: false, error: "Internal Server Error." });
    }
};

