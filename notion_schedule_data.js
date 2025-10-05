import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@notionhq/client';

// API Initialization
const dataSourceId = process.env.DATASOURCE_ID;
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Fetch datasource properties/fields
const datasource_response = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
const properties = datasource_response.properties;
console.log(properties);

// Fetch datasource rows
const datasource_query_response = await notion.dataSources.query({
  data_source_id: dataSourceId,
  filter: {
    and: [
      {
        property: 'Status',
        checkbox: {
        equals: false
        }
      },
      {
        property: 'Courses',
        select: {
          is_not_empty: true
        }
      },
      {
        property: 'Type',
        multi_select: {
          is_not_empty: true
        }
      },
    ],
    sorts: [
      {
        property: 'Dates',
        direction: 'ascending',
      },
    ],
  },
});
//console.log(datasource_query_response); // if "next_cursor" or "has_more" is true or non-null, dig through the Notion API docs to fix it

// Make new Object with wanted properties
const todo_objects = [];
let page_properties;

for (let i = 0; i < datasource_query_response.results.length ; i++) {
  page_properties = datasource_query_response.results[i].properties;
  console.log(page_properties);
  todo_objects.push({
    Name: page_properties.Name.title[0].plain_text,
    Date: Date(page_properties.Dates.date.start),
    Course: page_properties.Courses.select.name,
    Progress: page_properties.Progress.status.name,
    Type: page_properties.Type.multi_select[0].name
    })
}

console.log(todo_objects);