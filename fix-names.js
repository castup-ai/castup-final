import fs from 'fs';
import path from 'path';

const dir = 'c:\\Users\\sabar\\OneDrive\\Desktop\\Projects\\castup frontent by them\\antigravity-frontend\\src';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace user.firstName + user.lastName patterns with user.name
    content = content.replace(/user\.firstName\s*\+\s*['" ]+['"]\s*\+\s*user\.lastName/g, 'user.name');
    content = content.replace(/\{user\?\.firstName\}\s*\{user\?\.lastName\}/g, '{user?.name}');
    content = content.replace(/\{user\.firstName\}\s*\{user\.lastName\}/g, '{user.name}');
    content = content.replace(/\$\{user\.firstName\}\s*\$\{user\.lastName\}/g, '${user.name}');
    
    // Replace standalone user?.firstName or user.firstName with user.name
    content = content.replace(/user\?\.firstName/g, '(user?.name?.split(" ")[0])');
    content = content.replace(/user\.firstName/g, '(user.name?.split(" ")[0])');
    
    // Replace initials logic
    content = content.replace(/\{user\.firstName\?\.\[0\]\s*\|\|\s*'U'\}\{user\.lastName\?\.\[0\]\s*\|\|\s*''\}/g, "{(user.name || 'User').substring(0, 2).toUpperCase()}");
    content = content.replace(/user\.firstName\?\.\[0\]\s*\|\|\s*'U'/g, "(user.name || 'User')[0].toUpperCase()");
    content = content.replace(/user\.firstName\[0\]\}\{user\.lastName\[0\]/g, "(user.name || 'User').substring(0,2).toUpperCase()");

    // Job creator specific mapping (e.g. FindWork.jsx)
    content = content.replace(/job\.createdBy\?\.firstName/g, "(job.createdBy?.name?.split(' ')[0])");
    content = content.replace(/selectedJob\.createdBy\?\.firstName/g, "(selectedJob.createdBy?.name?.split(' ')[0])");
    
    // selectedProfile mapping (e.g. Explore.jsx)
    content = content.replace(/selectedProfile\.firstName/g, "(selectedProfile.name?.split(' ')[0])");
    content = content.replace(/selectedProfile\.lastName/g, "(selectedProfile.name?.split(' ').slice(1).join(' '))");
    
    // Fix any `u.firstName u.lastName` patterns (e.g. Explore.jsx search filter)
    content = content.replace(/\$\{u\.firstName\}\s*\$\{u\.lastName\}/g, '${u.name}');
    content = content.replace(/u\.firstName/g, '(u.name?.split(" ")[0])');
    content = content.replace(/u\.lastName/g, '(u.name?.split(" ").slice(1).join(" "))');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function traverse(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

traverse(dir);
console.log('Done!');
