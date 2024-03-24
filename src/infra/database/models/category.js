"use strict";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

module.exports = (sequelize, DataTypes) => {
  var Category = sequelize.define(
    "categories",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      parent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING
      },
      isDeleted: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      image: DataTypes.STRING,
      order: {
        type: DataTypes.INTEGER
      },
      createdBy: {
        type: DataTypes.UUID
      },
      updatedBy: {
        type: DataTypes.UUID
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      hooks: {
        /**
         * Get max order & set order auto increament
         */
        beforeCreate: (category, options, cb) => {
          Category.findOne({
            attributes: [
              [sequelize.fn("MAX", sequelize.col("order")), "order"]
            ],
            raw: true
          }).then(data => {
            if (data && data.order && !isNaN(data.order)) {
              const max = data.order + 1;
              category.order = max;
            } else {
              category.order = 1;
            }
            category.slug = slugify(category.name);
            return cb(null, options);
          });
        }
      },
      classMethods: {
        associate: function(models) {
          // associations can be defined here
          Category.hasMany(models.category, {
            onDelete: "CASCADE",
            foreignKey: "parent",
            as: "children"
          });
          Category.hasMany(models.product, {
            foreignKey: "categoryId",
            as: "products"
          });
        }
      }
    }
  );
  return Category;
};
