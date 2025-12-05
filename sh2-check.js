import fs from 'fs';

const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const compromised = JSON.parse(fs.readFileSync('compromised-packages.json', 'utf8'));

const affectedPackages = [];

function rmSymbols(str = "") {
  return str.replace(/[^0-9.]/g, '');
}

Object.keys(packageLock.packages).forEach(pName => {
  const package1 = packageLock.packages[pName];
  pName = pName.split('node_modules/')[1];
  console.log('Checking:', pName, package1.version);
  const found = compromised.packages.find(pkg => pkg.name === pName)
  if (found) {
    affectedPackages.push({
      package: pName,
      version: package1.version,
      versionMateches: found.affectedVersions.includes(rmSymbols(package1.version)),
      affectedVersions: found.affectedVersions
    });
  }
  package1.dependencies && 
    Object.keys(package1.dependencies).forEach(depName => {
    const dep = package1.dependencies[depName];
    console.log('- Checking:', depName, dep);
    const foundDep = compromised.packages.find(pkg => pkg.name === depName)
    if (foundDep) {
      affectedPackages.push({
        package: depName,
        version: dep,
        dependacyOf: pName,
        versionMateches: foundDep.affectedVersions.includes(rmSymbols(dep)),
        affectedVersions: foundDep.affectedVersions
      });
    }
  });
});

console.log('Affected Packages:', affectedPackages);
