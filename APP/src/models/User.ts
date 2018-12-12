module.exports = {
    id: {
        type: 'uuid',
        primary: true
    },
    name: 'string',
    firstname:'string',
    email:'string',
    //TODO : Complete
    published: {
        type:"relationship",
        target:"Recipe",
        relationship:"PUBLISH",
        direction:"out",
        eager: true
    },
    likedRecipes: {
        type:"relationship",
        target:"Recipe",
        relationship:"LIKE",
        direction:"out",
        eager: true
    },
    likedIngredients: {
        type:"relationship",
        target:"Ingredient",
        relationship:"LIKE",
        direction:"out",
        eager: true
    },
    followed: {
        type:"relationship",
        target:"User",
        relationship:"FOLLOW",
        direction:"out",
        eager: true
    }
};
