import Joi from "joi";
export const subscriptionSchema = Joi.object({
    // title, price, description, features
    title: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    maxHourlyUploads: Joi.number().required(),
    featuresText: Joi.array().items(Joi.string()).required()
})

const maxHourlyUploads = {
    NORMAL: 5,
    PLUS: 10,
    OVERKILL: 25
};

export const subscriptionPlans = Object.freeze({
    NORMAL: {
        title: "FREE",
        price: 0,
        description: "A small taster of what we offer",
        maxHourlyUploads: maxHourlyUploads.NORMAL,
        featuresText: [
            "5GB Free forever",
            "Total upload cap of 2TB",
            `Upload up to ${maxHourlyUploads.NORMAL} files per hour`,
            "Add credits whenever you want"
        ]
    },
    PLUS: {
        title: "PLUS",
        price: 2.99,
        description: "For users wanting to upload more than 2TB",
        maxHourlyUploads: maxHourlyUploads.PLUS,
        featuresText: [
            "Total upload cap of 10TB",
            `Upload up to ${maxHourlyUploads.PLUS} files per hour`,
            "Encrypt your files with AES-GCM and share keys via URLs",
            "Use ShareX to upload files",
            "Choose when links expire",
            "5% off all credit top-ups",
            "Import files from other services"
        ]
    },
    OVERKILL: {
        title: "OVERKILL",
        price: 12.99,
        description: "Great for businesses who need to securely store large amounts of data",
        maxHourlyUploads: maxHourlyUploads.OVERKILL,
        featuresText: [
            "All the perks of Plus",
            "Total upload cap of 50TB",
            `Upload up to ${maxHourlyUploads.OVERKILL} files per hour`,
            "10% off all credit top-ups",
            "Priority support"
        ]
    }
});