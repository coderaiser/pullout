# Pullout [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Pull out data from stream.

## Install

```
npm i pullout
```

## pullout(stream[, type = 'string'])

Type could be `string` or `buffer`.

```js
const pullout = require('pullout'),
const fs = require('fs'),

const readStream = fs.createReadStream(__filename);

const data = await pullout(readStream);
console.log(data);
```

## Related

- [pipe-io](https://github.com/coderaiser/pipe-io "pipe-io") - pipe streams and handle events

## License
MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/pullout.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/pullout/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/pullout.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/pullout/badge.svg?branch=master&service=github
[NPMURL]:                   https://npmjs.org/package/pullout "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/pullout  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/pullout "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]:              https://coveralls.io/github/coderaiser/pullout?branch=master

