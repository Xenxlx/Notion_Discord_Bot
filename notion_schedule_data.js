import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@notionhq/client';

function text_todo(todo_objects) {
  let text = "";
  if (!todo_objects.length) {
    text = "You're all done for the week! (For now...)";
  } else {

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (let i = 0; i < todo_objects.length; i++) {
      let todo = todo_objects[i];
      let date = [days[todo.Date.getDay()]]; // Or just .Date[0] for short-form
      let time = `:clock3: ${date}\n`;
      let desc = `:scroll: ${todo.Name} ~ ${todo.Course}`;
      if (todo.Progress != 'In progress') {
        desc += "\n:dotted_line_face:You haven't started";
      }
      text += time + desc;
    }
  }
  return text;
}

export async function get_weekly_todo() {
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
          property: 'Dates',
          date: {
            next_week: {}
          }
        },
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
    //console.log(page_properties);
    todo_objects.push({
      Name: page_properties.Name.title[0].plain_text,
      Date: new Date(page_properties.Dates.date.start),
      Course: page_properties.Courses.select.name,
      Progress: page_properties.Progress.status.name,
      Type: page_properties.Type.multi_select[0].name
      })
  }

  //console.log(todo_objects);
  return text_todo(todo_objects);
}