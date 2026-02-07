const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Plumbing', 'Electrical', 'Mechanical', 'General']
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        default: '/images/default-service.png'
    },
    onSale: {
        type: Boolean,
        default: false
    },
    saleEndDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a text index for the chatbot's context search
ServiceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);