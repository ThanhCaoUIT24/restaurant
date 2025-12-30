const authService = require('./src/services/auth.service');

async function checkUser(username, password='123'){
  try{
    console.log(`\nChecking ${username}...`);
    const res = await authService.login({ username, password });
    const perms = res.user.permissions || [];
    console.log(`Roles: ${res.user.roles}`);
    console.log(`Has KDS_VIEW: ${perms.includes('KDS_VIEW')}`);
    console.log(`Permissions (${perms.length}): ${perms.join(', ')}`);
  }catch(err){
    console.error(`Error for ${username}:`, err.message);
  }
}

(async function(){
  await checkUser('chef','chef123');
  await checkUser('manager','manager123');
  await checkUser('admin','admin123');
  process.exit(0);
})();