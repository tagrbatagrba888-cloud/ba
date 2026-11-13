const admin=require('firebase-admin');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).end();
 try{
  const me=await admin.auth().verifyIdToken((req.headers.authorization||'').replace('Bearer ','')),{to,body}=req.body||{},db=admin.firestore();
  const [s,r]=await Promise.all([db.doc('users/'+me.uid).get(),db.doc('users/'+to).get()]);
  if(!s.exists||s.data().status!=='approved'||!r.exists)return res.status(403).json({error:'forbidden'});
  const tokens=r.data().tokens||[];
  if(!tokens.length)return res.json({sent:0});
  const out=await admin.messaging().sendEachForTokens({tokens,data:{title:s.data().username,body:String(body||'').slice(0,120),url:'chat.html?u='+me.uid},webpush:{headers:{Urgency:'high'}},android:{priority:'high'}});
  const bad=[];out.responses.forEach((x,i)=>{if(!x.success&&/not-registered|invalid-registration/.test(x.error.code))bad.push(tokens[i])});
  if(bad.length)await r.ref.update({tokens:admin.firestore.FieldValue.arrayRemove(...bad)});
  res.json({sent:out.successCount});
 }catch(e){res.status(401).json({error:'unauthorized'})}};
