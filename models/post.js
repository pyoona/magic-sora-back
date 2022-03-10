import { Model, DataTypes, where, Op} from 'sequelize';
import sequelize from './index.js';
import { models } from './init-models.js';

export class Post extends Model {
  static associate(models) {
    this.hasMany(models.Choice, {
      foreignKey: 'post_id',
      sourceKey: 'post_id',
    });
    this.hasMany(models.Comment, {
      foreignKey: 'post_id',
      sourceKey: 'post_id',
    });

    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id',
    });

    this.belongsToMany(models.User, {
      through: models.VoteByUser,
      foreignKey: 'post_id',
    });

    this.hasMany(models.VoteByUser, {
      foreignKey : 'post_id', sourceKey: 'post_id'
    });

    this.belongsToMany(models.NonUser, {
      through: models.VoteByNonUser,
      foreignKey: 'post_id',
    });
    this.belongsToMany(models.Tag, {
      through: models.TagOfPost,
      foreignKey: 'post_id',
    });
  }
  
  static async searchPostTitle(search){
    return await models.Post.findAll({
      include : [{
          model: models.User,
      }],
      attributes: ['post_id', 'user_id', 'post_title', 'register_date'],
      where: { post_title : {[Op.like]: search}},
  })
  }
  static async searchPostContent(search){
    return await models.Post.findAll({
      include : [{
          model: models.User,
      }],
      attributes: ['post_id', 'user_id', 'post_title', 'register_date'],
      where: { post_content : {[Op.like]: search}},
    })
  }
  static async getPostById(id){
    return await this.findOne({
      where: {post_id : id},
    })
  }
  static async deletePost(id) {
    await this.destroy({
      where: { post_id: id },
    });
  }
  static async getNewPost(){
    return await this.findAll({
      attributes: ['post_id', 'user_id', 'post_title', 'register_date'],
      order : [['post_id', 'DESC']]
    })
  }
  static async getDeadlinePost(){
    return await this.findAll({
      attributes: ['post_id', 'user_id', 'post_title', 'register_date'],
      where: { finish_date : {[Op.gt]: new Date()}},
      order : [['post_id', 'DESC']]
    })
  }
  static async getEndPost(){
    return await this.findAll({
      attributes: ['post_id', 'user_id', 'post_title', 'register_date'],
      where: { finish_date : {[Op.lt]:new Date()}},
      order : [['post_id', 'DESC']]
    })
  }
  static async getHotPost(){
    return await this.findAll({
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('VoteByUsers.post_id')), 'count']],
      },
      include : [{
        model: models.VoteByUser,
        attributes: [],
      }],
      group : ['VoteByUsers.post_id'],
      order : [[sequelize.col('count'), 'DESC']]
    })
  }
//###########################################//
  async getPostInfo(author) {
    let tags = await this.getTags({
      attributes: ['tag_name'],
    });
    tags = tags.map(tag => {
      return tag.tag_name;
    });

    const thumbnail = await this.getChoices({
      attributes: ['photo_url'],
      limit: 1,
    });

    const comments = await this.getComments({
      attributes: ['comment_id'],
    });

    return {
      id: this.post_id,
      title: this.post_title,
      registerDate: this.register_date,
      author: author.nickname,
      tags: tags,
      thumbnail: thumbnail[0].photo_url,
      commentNum: comments.length,
    };
  }
  async getPostDetailInfo(author) {
    let tags = await this.getTags({
      attributes: ['tag_name'],
    });
    tags = tags.map(tag => {
      return tag.tag_name;
    });

    let choices = await this.getChoices();
    let choice_content = [], photo_url = [];
    choices.forEach((item)=>{
      choice_content.push(item.choice_content);
      photo_url.push(item.photo_url);
    })

    return {
      id: this.post_id,
      title: this.post_title,
      content: this.post_content,
      registerDate: this.register_date,
      finishDate: this.finish_date,
      author: author.nickname,
      tags: tags,
      choice_content: choice_content,
      photo_url: photo_url
    };
  }
}

Post.init(
  {
    post_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'user_id',
      },
    },
    post_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    post_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    register_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    finish_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'post',
    timestamps: false,
    paranoid: false,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'post_id' }],
      },
      {
        name: 'FK_user_TO_post_1',
        using: 'BTREE',
        fields: [{ name: 'user_id' }],
      },
    ],
  },
);
