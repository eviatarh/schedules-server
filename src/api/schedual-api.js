const FormatUtils = require("../utils/formatter");
const DataAccess = require("../utils/data-access");


const escapeSQL = str => str.replace(/'/g, "''");
const arrayJSONSql = arr => `array[${arr.map(obj=>`'${escapeSQL(JSON.stringify(obj))}'::json`)}]::json[]`;
const handleError = (req, res)=>{
  return async function(requestCallback){
    try {
      await Promise.resolve(requestCallback(req, res))
    }
    catch(err){
      console.log(`error in request for ${req.url} : ${err.message}`);
      res.status(500).send({err: err.message});
    }
  }
};

class SchedualApi {
  static init(app) {
    app.get('/events', (req, res)=>handleError(req,res)(SchedualApi.getEvents));
    app.post('/event/fetchId', (req, res)=>handleError(req,res)(SchedualApi.fetchId));
    app.post('/event', (req, res)=>handleError(req,res)(SchedualApi.upsertEvent));
    app.delete('/event', (req, res)=>handleError(req,res)(SchedualApi.deleteEvent));
  }


  static async getEvents(req, res) {
    const {eventId} = req.query;
    const formatResult = result => {
      return FormatUtils.formatter(result, {id: ['id',val=>+val],
                                           display_name:'displayName',
                                           time_from: 'timePeriod.from',
                                           time_to:'timePeriod.to',
                                           roles_needed: 'rolesNeeded'})
    };
    let results = await DataAccess.seq.query(`select * from schedule_event${(eventId !== undefined) ? ` WHERE id = ${eventId}` : ''}`,
      {type: 'SELECT'});
    if (eventId !== undefined) {
      if (results.length > 0) {
        res.send(formatResult(results[0]));
      } else {
        res.status(500).send({error: `event ${eventId} isn't exist!`});
      }
    } else {
      res.send(results.map(formatResult));
    }
  }

  static async upsertEvent(req, res) {
    const {event} = req.body;

    const insertStatement = 'insert into schedule_event(id, display_name,date,time_from, time_to'+
      `${event.rolesNeeded ? ',roles_needed':''}${event.manning?',manning':''}) `+
      `values(${event.id},'${escapeSQL(event.displayName)}', '${event.date}', '${event.timePeriod.from}', `+
      `'${event.timePeriod.to}'` +
      `${event.rolesNeeded ? `, ${arrayJSONSql(event.rolesNeeded)}`:''}` +
      `${event.manning ? `, ${arrayJSONSql(event.manning)}`:''})`;


    const updateStatement = 'update set ' +
      `display_name='${escapeSQL(event.displayName)}', date='${event.date}', `+
      `time_from = '${event.timePeriod.from}', time_to='${event.timePeriod.to}' `+
      `${event.rolesNeeded ? `,roles_needed=${arrayJSONSql(event.rolesNeeded)} ` : ''}` +
      `${event.manning ? `,manning='${arrayJSONSql(event.manning)}' ` : ''}` +
      `where schedule_event.id = ${event.id}`;

    console.log(`upserting event ${event.id}...`);
    const query = `${insertStatement} on conflict (id) do ${updateStatement}`;
    await DataAccess.seq.query(query);
    console.log(`Event ${event.id} upserted successfully...`);
    res.send(event);
  }

  /*
  * insert into schedule_event(id, display_name,date,time_from, time_to,roles_needed)
values(28,'',
'2018-10-31T22:00:00.000Z',
'2018-11-03T12:25:32.109Z',
'2018-11-03T12:25:32.109Z',
array['{"roleId":0,"quantityRequired":1}'::json]) on conflict (id)  do
update set display_name='אירוע לשמירה',
date='2018-10-31T22:00:00.000Z',
time_from = '2018-11-03T12:25:32.109Z',
time_to='2018-11-03T12:25:32.109Z',
roles_needed=array['{"roleId":0,"quantityRequired":1}'::json] where schedule_event.id = 28
  * */

  static async deleteEvent(req, res) {
    const {event} = req.body;
    console.log(`deleting event ${event.id}...`);
    await DataAccess.seq.query(`delete from schedule_event where id = ${event.id}`);
    console.log(`deleted of event ${id} successfully`);
    res.send(event);
  }

  static async fetchId(req, res) {
    let eventResult = ((await DataAccess.seq.query('select nextval(\'schedule_seq\'::regclass) as "eventId"', {type: 'SELECT'}))[0]);
    eventResult.eventId = +eventResult.eventId;
    res.send(eventResult);
  }


}
module.exports = SchedualApi;
//id, displayName, date, time_from, time_to, roles_needed, manning
