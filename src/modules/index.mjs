
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
      where,
    } = args;

    // console.log("YoutubeChannelFeed where", where);

    let uri = new URI("https://www.youtube.com/feeds/videos.xml");

    uri = uri.query(where);

    let result;

    await fetch(uri.toString())
      .then(response => response.text())
      .then(xml => {

        // console.log("YoutubeChannelFeed str", xml);

        var json = xmlParser.toJson(xml);


        // console.log("YoutubeChannelFeed json type",  typeof json);

        if (json) {
          result = JSON.parse(json);
        }

      });

    return result
  }


}


export default Module;