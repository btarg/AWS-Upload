import Joi from "joi";

export const subscriptionSchema = Joi.object({
    // title, price, description, features
    title: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
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

export const subscriptionFeatures = {
    "FREE_5GB": "5GB of storage, free forever",
    "FREE_10GB": "10GB of storage, free forever",
    "FREE_15GB": "15GB of storage, free forever",
    "AES_GCM": "AES-GCM File Encryption",
    "SHAREX": "Use ShareX to upload files",
    "CONTROL_EXPIRY": "Choose when links expire",
    "IMPORT": "Import files from other services",
    "DISCOUNT_5": "5% off all credit top-ups",
    "DISCOUNT_10": "10% off all credit top-ups"
};
export const getMappedFeatures = (features) => {
    return features.map(feature => subscriptionFeatures[feature]);
}

export const subscriptionPlans = {
    NORMAL: {
        title: "FREE",
        price: 0,
        description: "A small taster of what we offer. Start with 5GB of storage and top up with credits.",
        maxHourlyUploads: maxHourlyUploads.NORMAL,
        totalUploadCap: totalUploadCaps.NORMAL,
        features:["FREE_5GB"]
    },
    PLUS: {
        title: "PLUS",
        price: 5.99,
        description: "For users wanting to upload more than 2TB.",
        maxHourlyUploads: maxHourlyUploads.PLUS,
        totalUploadCap: totalUploadCaps.PLUS,
        features: [
            "FREE_10GB",
            "AES_GCM",
            "SHAREX",
            "CONTROL_EXPIRY",
            "DISCOUNT_5"
        ]
    },
    
    OVERKILL: {
        title: "OVERKILL",
        price: 12.99,
        description: "Great for businesses who need to securely store large amounts of data.",
        maxHourlyUploads: maxHourlyUploads.OVERKILL,
        totalUploadCap: totalUploadCaps.OVERKILL,
        features: [
            "FREE_15GB",
            "AES_GCM",
            "SHAREX",
            "CONTROL_EXPIRY",
            "DISCOUNT_10"
        ]
    }
};