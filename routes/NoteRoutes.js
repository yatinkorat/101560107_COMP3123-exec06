
const express = require('express');
const mongoose = require('mongoose');
const noteModel = require('../models/NotesModel.js');

const noteRoutes = express.Router();

// Create a new Note
noteRoutes.post('/notes', async (req, res) => {
    try {
        if (!req.body.content) {
            return res.status(400).send({
                message: 'Note content cannot be empty'
            });
        }

        const note = new noteModel(req.body.content);
        const savedNote = await note.save();

        return res.status(201).json(savedNote);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Retrieve all Notes
noteRoutes.get('/notes', async (req, res) => {
    try {
        const notes = await noteModel.find();
        return res.status(200).json(notes);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Retrieve a single Note by ID
noteRoutes.get('/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;

        if (!mongoose.isValidObjectId(noteId)) {
            return res.status(400).json({ message: 'Invalid note ID' });
        }

        const note = await noteModel.findById(noteId);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        return res.status(200).json(note);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Update a Note by ID
noteRoutes.put('/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;

        if (!mongoose.isValidObjectId(noteId)) {
            return res.status(400).json({ message: 'Invalid note ID' });
        }

        if (!req.body.content ||
            Object.keys(req.body.content).length === 0) {
            return res.status(400).json({
                message: 'Note content cannot be empty'
            });
        }

        const content = { ...req.body.content };

        // Update the date when the note is modified
        content.dateUpdated = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const updatedNote = await noteModel.findByIdAndUpdate(
            noteId,
            { $set: content },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        return res.status(200).json(updatedNote);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Delete a Note by ID
noteRoutes.delete('/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;

        if (!mongoose.isValidObjectId(noteId)) {
            return res.status(400).json({ message: 'Invalid note ID' });
        }

        const deletedNote = await noteModel.findByIdAndDelete(noteId);

        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        return res.status(200).json({
            message: 'Note deleted successfully',
            note: deletedNote
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = noteRoutes;
