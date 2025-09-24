"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sequelize = qi.sequelize;

    async function hasColumn(col){
      const [cols] = await sequelize.query("SHOW COLUMNS FROM `announcements` LIKE :c", { replacements: { c: col } });
      return cols.length > 0;
    }

    // Add imageKeys field to store S3 object keys instead of URLs
    if (!(await hasColumn('image_keys'))) {
      await qi.addColumn('announcements', 'image_keys', { 
        type: Sequelize.JSON, 
        allowNull: true,
        comment: 'Array of S3 object keys for announcement images'
      });
    }

    // Migrate existing image_urls to image_keys if they exist
    if (await hasColumn('image_urls')) {
      const [announcements] = await sequelize.query("SELECT id, image_urls FROM announcements WHERE image_urls IS NOT NULL");
      
      for (const ann of announcements) {
        try {
          const imageUrls = JSON.parse(ann.image_urls);
          if (Array.isArray(imageUrls) && imageUrls.length > 0) {
            // Extract S3 keys from URLs
            const imageKeys = imageUrls.map(url => {
              if (typeof url === 'string' && url.includes('schools/')) {
                // Extract key from URL like: https://bucket.s3.region.amazonaws.com/schools/123/announcements/uuid.ext
                const match = url.match(/schools\/\d+\/announcements\/[^\/]+$/);
                return match ? match[0] : null;
              }
              return null;
            }).filter(key => key !== null);
            
            if (imageKeys.length > 0) {
              await sequelize.query(
                "UPDATE announcements SET image_keys = :keys WHERE id = :id",
                { 
                  replacements: { keys: JSON.stringify(imageKeys), id: ann.id }
                }
              );
            }
          }
        } catch (e) {
          console.warn(`Failed to migrate image_urls for announcement ${ann.id}:`, e.message);
        }
      }
    }
  },

  async down(queryInterface) {
    const qi = queryInterface;
    try { 
      await qi.removeColumn('announcements', 'image_keys'); 
    } catch (e) {
      console.warn('Failed to remove image_keys column:', e.message);
    }
  }
};
