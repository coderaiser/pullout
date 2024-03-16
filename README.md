# Pullout [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/pullout.svg?style=flat
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/pullout/badge.svg?branch=master&service=github
[NPMURL]: https://npmjs.org/package/pullout "npm"
[BuildStatusURL]: https://github.com/coderaiser/pullout/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/pullout/workflows/Node%20CI/badge.svg
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]: https://coveralls.io/github/coderaiser/pullout?branch=master

Pull out data from stream.

## Install

```
npm i pullout
```

## pullout(stream[, type = 'string'])

Type could be `string` or `buffer`.

```js
const pullout = require('pullout');
const fs = require('fs');

const readStream = fs.createReadStream(__filename);

const data = await pullout(readStream);
console.log(data);
```

## Related

- [pipe-io](https://github.com/coderaiser/pipe-io "pipe-io") - pipe streams and handle events

## License

MIT
