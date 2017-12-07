import React from 'react'
import PropTypes from 'prop-types'
import S3Upload from 'react-s3-uploader/s3upload'
import Dropzone from 'react-dropzone'

// https://github.com/moroshko/shallow-equal/blob/master/src/objects.js
const shallowEqual = (objA, objB) => {
  if (objA === objB) {
    return true;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

export default class DropzoneS3Uploader extends React.Component {

  static propTypes = {
    fileName: PropTypes.string,
    s3Url: PropTypes.string,
    notDropzoneProps: PropTypes.array.isRequired,
    isImage: PropTypes.func,
    passChildrenProps: PropTypes.bool,

    // if true, all the child nodes will be placed outside the dropArea
    placeChildrenOutsideDropArea: PropTypes.bool,

    imageComponent: PropTypes.func,
    fileComponent: PropTypes.func,
    progressComponent: PropTypes.func,
    errorComponent: PropTypes.func,

    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),

    childrenDropzone: PropTypes.node,

    onDrop: PropTypes.func,
    onError: PropTypes.func,
    onProgress: PropTypes.func,
    onFinish: PropTypes.func,

    // Passed to react-s3-uploader
    upload: PropTypes.object.isRequired,

    // Default styles for react-dropzone
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    style: PropTypes.object,
    activeStyle: PropTypes.object,
    rejectStyle: PropTypes.object,
  }

  static defaultProps = {
    upload: {},
    className: 'react-dropzone-s3-uploader',
    passChildrenProps: true,
    s3Url: '',
    isImage: fileName => fileName && fileName.match(/\.(jpeg|jpg|gif|png|svg)/i),
    notDropzoneProps: ['onFinish', 'childrenDropzone', 'containerStyle', 'placeChildrenOutsideDropArea', 's3Url', 'fileName', 'host', 'upload', 'isImage', 'notDropzoneProps', 'waitToUpload', 'onDrop'],
    style: {
      width: 200,
      height: 200,
      border: 'dashed 2px #999',
      borderRadius: 5,
      position: 'relative',
      cursor: 'pointer',
      overflow: 'hidden',
    },
    activeStyle: {
      borderStyle: 'solid',
      backgroundColor: '#eee',
    },
    rejectStyle: {
      borderStyle: 'solid',
      backgroundColor: '#ffdddd',
    },
  }

  constructor(props) {
    super()
    const uploadedFiles = []
    const {fileName} = props
    if (fileName) {
      uploadedFiles.push({
        fileName,
        fileUrl: this.fileUrl(props.s3Url, fileName),
        default: true,
        file: {},
      })
    }
    this.state = { uploadedFiles, pendingUploads: [] }
  }

  componentWillMount = () => this.setUploaderOptions(this.props)
  componentWillReceiveProps = nextProps => {
    if (!shallowEqual(nextProps.upload, this.props.upload)) {
      this.setUploaderOptions(nextProps);
    }

    if (this.props.waitToUpload && !nextProps.waitToUpload) {
      const uploaderOptions = this.getUploaderOptions(nextProps);
      this.uploadPendingFiles(uploaderOptions);
    }
  }

  uploadPendingFiles = (uploaderOptions) => {
    this.state.pendingUploads.forEach(files => new S3Upload({ files, ...uploaderOptions }));
  }

  getUploaderOptions = props => {
    return Object.assign({
      s3path: '',
      contentDisposition: 'auto',
      onFinishS3Put: this.handleFinish,
      onProgress: this.handleProgress,
      onError: this.handleError,
    }, props.upload);
  }

  setUploaderOptions = props => {
    const uploaderOptions = this.getUploaderOptions(props);
    this.setState(Object.assign({}, this.state, { uploaderOptions }));
  }

  handleProgress = (progress, textState, file) => {
    this.props.onProgress && this.props.onProgress(progress, textState, file)
    this.setState(Object.assign({}, this.state, { progress }));
  }

  handleError = (err, file) => {
    this.props.onError && this.props.onError(err, file)
    this.setState(Object.assign({}, this.state, { error: err, progress: null }));
  }

  handleFinish = (info, file) => {
    const uploadedFile = Object.assign({
      file,
      fileUrl: this.fileUrl(this.props.s3Url, info.fileName || info.filename),
    }, info)

    const uploadedFiles = this.state.uploadedFiles
    uploadedFiles.push(uploadedFile)

    this.props.onFinish && this.props.onFinish(uploadedFile)

    this.setState(Object.assign({}, this.state, { uploadedFiles, error: null, progress: null }));
  }

  handleDrop = (files, rejectedFiles) => {
    const pendingUploads = [].concat(this.state.pendingUploads);
    const options = {
      files,
      ...this.state.uploaderOptions,
    };

    if (this.props.waitToUpload) {
      pendingUploads.push(files);
    } else {
      new S3Upload(options) // eslint-disable-line
    }

    this.setState(Object.assign({}, this.state, {
      uploadedFiles: [],
      error: null,
      progress: null,
      pendingUploads,
    }));

    this.props.onDrop && this.props.onDrop(files, rejectedFiles)
  }

  fileUrl = (s3Url, fileName) => `${s3Url.endsWith('/') ? s3Url.slice(0, -1) : s3Url}/${fileName}`

  renderImage = ({uploadedFile}) => (<div className="rdsu-image"><img src={uploadedFile.fileUrl} /></div>)

  renderFile = ({uploadedFile}) => (
    <div className="rdsu-file">
      <div className="rdsu-file-icon"><span className="fa fa-file-o" style={{fontSize: '50px'}} /></div>
      <div className="rdsu-filename">{uploadedFile.file.name}</div>
    </div>
  )

  renderProgress = ({progress}) => (progress ? (<div className="rdsu-progress">{progress}</div>) : null)

  renderError = ({error}) => (error ? (<div className="rdsu-error small">{error}</div>) : null)

  render() {
    const {
      s3Url,
      passChildrenProps,
      children,
      imageComponent,
      fileComponent,
      progressComponent,
      errorComponent,
      ...dropzoneProps,
    } = this.props

    const ImageComponent = imageComponent || this.renderImage
    const FileComponent = fileComponent || this.renderFile
    const ProgressComponent = progressComponent || this.renderProgress
    const ErrorComponent = errorComponent || this.renderError

    const {uploadedFiles} = this.state
    const childProps = {s3Url, ...this.state}
    this.props.notDropzoneProps.forEach(prop => delete dropzoneProps[prop])

    let content = null
    let outsideContent = null

    if (children) {
      const childrenContent = passChildrenProps ?
        React.Children.map(children, child => React.cloneElement(child, childProps)) :
        this.props.children

      if (this.props.placeChildrenOutsideDropArea) {
        outsideContent = childrenContent

        if (this.props.childrenDropzone) {
          content = React.Children.map(this.props.childrenDropzone, child => React.cloneElement(child, childProps))
        }
      } else {
        content = childrenContent
      }
    }
    else {
      content = (
        <div>
          {uploadedFiles.map(uploadedFile => {
            const props = {
              key: uploadedFile.fileName,
              uploadedFile: uploadedFile,
              ...childProps,
            }
            return this.props.isImage(uploadedFile.fileUrl) ?
              (<ImageComponent  {...props} />) :
              (<FileComponent {...props} />)
          })}
          <ProgressComponent {...childProps} />
          <ErrorComponent {...childProps} />
        </div>
      )
    }

    return (
      <div style={this.props.containerStyle}>
        {outsideContent}
        <Dropzone ref={c => this._dropzone = c} onDrop={this.handleDrop} {...dropzoneProps}>
          {content}
        </Dropzone>
      </div>
    )
  }
}
