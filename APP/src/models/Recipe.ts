module.exports = {
    id: {
        type: 'uuid',
        primary: true
    },
    name: 'string',
    preparation: 'number',
    // Relation : une RECIPE HAS un INGREDIENT
    has: {
        type:"relationship",
        target:"Ingredient",
        relationship:"HAS",
        direction:"out",
        properties: {
            quantity: "string",
            unit: "string"
        },
        eager: true
    }
};