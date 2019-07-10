
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

import URI from "urijs";

import xmlParser from 'xml2json';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema

// console.log("xmlParser", xmlParser);

class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    Object.assign(this, {
    });

  }


  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), []);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const {
      Query,
      Mutation,
      Subscription,
      ...resolvers
    } = super.getResolvers();


    return {
      ...resolvers,
      Query: {
        ...Query,
        YoutubeChannelFeed: this.YoutubeChannelFeed.bind(this),
      },
    };
  }


  async YoutubeChannelFeed(source, args, ctx, info) {

    const {
      where: {
        user,
        playlist: playlist_id,
        channel: channel_id,
      },
    } = args;

    // console.log("YoutubeChannelFeed where", where);

    let uri = new URI("https://www.youtube.com/feeds/videos.xml");

    let where;

    if (user) {
      where = {
        user,
      };
    }
    else if (playlist_id) {
      where = {
        playlist_id,
      };
    }
    else if (channel_id) {
      where = {
        channel_id,
      };
    }
    else {

      throw new Error("user or playlist or channel is required");
    }

    uri = uri.query({
      user,
      playlist_id,
      channel_id,
    });

    let result;

    await fetch(uri.toString())
      .then(response => response.text())
      .then(xml => {

        // console.log("YoutubeChannelFeed str", xml);

        let json;

        try {
          json = xmlParser.toJson(xml);
        }
        catch (error) {

          console.error(json);

          throw (error);
        }

        if (json) {
          result = JSON.parse(json);
        }
        else {

          throw new Error("Can not get data");
        }

      });

    return result
  }


}


export default Module;