const admin=require('firebase-admin');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).end();
 let me;
 try{me=await admin.auth().verifyIdToken((req.headers.authorization||'').replace('Bearer ',''))}catch(e){return res.status(401).json({error:'unauthorized'})}
 try{
  const {to,body}=req.body||{},db=admin.firestore();
  const [s,r]=await Promise.all([db.doc('users/'+me.uid).get(),db.doc('users/'+to).get()]);
  if(!s.exists||s.data().status!=='approved'||!r.exists)return res.status(403).json({error:'forbidden'});
  const tokens=r.data().tokens||[];
  if(!tokens.length)return res.json({sent:0,reason:'no-tokens'});
  const out=await admin.messaging().sendEachForTokens({tokens,data:{title:s.data().username,body:String(body||'').slice(0,120),url:'chat.html?u='+me.uid},webpush:{headers:{Urgency:'high'}},android:{priority:'high'}});
  const bad=[];out.responses.forEach((x,i)=>{if(!x.success){console.error('FCM',x.error.code,x.error.message);if(/not-registered|invalid-registration/.test(x.error.code))bad.push(tokens[i])}});
  if(bad.length)await r.ref.update({tokens:admin.firestore.FieldValue.arrayRemove(...bad)});
  res.json({sent:out.successCount,failed:out.failureCount});
 }catch(e){console.error('notify',e);res.status(500).json({error:String(e.message)})}};
