import Joi from "joi";

export const subscriptionSchema = Joi.object({
    // title, price, description, features
    title: Joi.string().required(),
    price: Joi.number().required(),
    maxHourlyUploads: Joi.number().required(),
    totalUploadCap: Joi.number().required(),
    features: Joi.array().items(Joi.string()).required()
})

const totalUploadCaps = {
    NORMAL: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
    PLUS: 10 * 1024 * 1024 * 1024 * 1024, // 10TB
    OVERKILL: 50 * 1024 * 1024 * 1024 * 1024 // 50TB
};

const maxHourlyUploads = {
    NORMAL: 5,
    PLUS: 15,
    OVERKILL: 25
};

export const planDescriptions = {
    NORMAL: "A small taster of what we offer. Start with 5GB of storage and top up with credits.",
    PLUS: "For users wanting to upload more than 2TB.",
    OVERKILL: "Great for businesses who need to securely store large amounts of data."
}
export const subscriptionFeatures = {
    "FREE_5GB": "5GB of storage, free forever",
    "FREE_10GB": "10GB of storage, free forever",
    "FREE_15GB": "15GB of storage, free forever",
    "AES_CBC": "AES-CBC File Encryption",
    "SHAREX": "Use ShareX to upload files",
    "CONTROL_EXPIRY": "Create temporary links",
    "IMPORT": "Import files from other services",
    "DISCOUNT_5": "5% off all credit top-ups",
    "DISCOUNT_10": "10% off all credit top-ups"
};
export const getMappedFeatures = (features) => {
    return features.map(feature => subscriptionFeatures[feature]);
}
export const getDescription = (plan) => {
    return planDescriptions[plan];
}
export const getSubscriptionPlan = (planName) => {
    return subscriptionPlans[planName];
}

export const subscriptionPlans = {
    // The title and key need to be the same for other functions to read them properly
    NORMAL: {
        title: "FREE",
        price: 0,
        maxHourlyUploads: maxHourlyUploads.NORMAL,
        totalUploadCap: totalUploadCaps.NORMAL,
        features:["FREE_5GB"]
    },
    PLUS: {
        title: "PLUS",
        price: 3.99,
        maxHourlyUploads: maxHourlyUploads.PLUS,
        totalUploadCap: totalUploadCaps.PLUS,
        features: [
            "FREE_10GB",
            "AES_CBC",
            "SHAREX",
            "CONTROL_EXPIRY",
            "DISCOUNT_5"
        ]
    },
    
    OVERKILL: {
        title: "OVERKILL",
        price: 12.99,
        maxHourlyUploads: maxHourlyUploads.OVERKILL,
        totalUploadCap: totalUploadCaps.OVERKILL,
        features: [
            "FREE_15GB",
            "AES_CBC",
            "SHAREX",
            "CONTROL_EXPIRY",
            "DISCOUNT_10"
        ]
    }
};