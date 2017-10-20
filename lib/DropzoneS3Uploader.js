var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';
import S3Upload from 'react-s3-uploader/s3upload';
import Dropzone from 'react-dropzone';

var DropzoneS3Uploader = function (_React$Component) {
  _inherits(DropzoneS3Uploader, _React$Component);

  function DropzoneS3Uploader(props) {
    _classCallCheck(this, DropzoneS3Uploader);

    var _this = _possibleConstructorReturn(this, (DropzoneS3Uploader.__proto__ || Object.getPrototypeOf(DropzoneS3Uploader)).call(this));

    _initialiseProps.call(_this);

    var uploadedFiles = [];
    var fileName = props.fileName;

    if (fileName) {
      uploadedFiles.push({
        fileName: fileName,
        fileUrl: _this.fileUrl(props.s3Url, fileName),
        default: true,
        file: {}
      });
    }
    _this.state = { uploadedFiles: uploadedFiles };
    return _this;
  }

  _createClass(DropzoneS3Uploader, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          s3Url = _props.s3Url,
          passChildrenProps = _props.passChildrenProps,
          children = _props.children,
          imageComponent = _props.imageComponent,
          fileComponent = _props.fileComponent,
          progressComponent = _props.progressComponent,
          errorComponent = _props.errorComponent,
          dropzoneProps = _objectWithoutProperties(_props, ['s3Url', 'passChildrenProps', 'children', 'imageComponent', 'fileComponent', 'progressComponent', 'errorComponent']);

      var ImageComponent = imageComponent || this.renderImage;
      var FileComponent = fileComponent || this.renderFile;
      var ProgressComponent = progressComponent || this.renderProgress;
      var ErrorComponent = errorComponent || this.renderError;

      var uploadedFiles = this.state.uploadedFiles;

      var childProps = _extends({ s3Url: s3Url }, this.state);
      this.props.notDropzoneProps.forEach(function (prop) {
        return delete dropzoneProps[prop];
      });

      var content = null;
      var outsideContent = null;

      if (children) {
        var childrenContent = passChildrenProps ? React.Children.map(children, function (child) {
          return React.cloneElement(child, childProps);
        }) : this.props.children;

        if (this.props.placeChildrenOutsideDropArea) {
          outsideContent = childrenContent;

          if (this.props.childrenDropzone) {
            content = React.Children.map(this.props.childrenDropzone, function (child) {
              return React.cloneElement(child, childProps);
            });
          }
        } else {
          content = childrenContent;
        }
      } else {
        content = React.createElement(
          'div',
          null,
          uploadedFiles.map(function (uploadedFile) {
            var props = _extends({
              key: uploadedFile.fileName,
              uploadedFile: uploadedFile
            }, childProps);
            return _this2.props.isImage(uploadedFile.fileUrl) ? React.createElement(ImageComponent, props) : React.createElement(FileComponent, props);
          }),
          React.createElement(ProgressComponent, childProps),
          React.createElement(ErrorComponent, childProps)
        );
      }

      return React.createElement(
        'div',
        { style: this.props.containerStyle },
        outsideContent,
        React.createElement(
          Dropzone,
          _extends({ ref: function ref(c) {
              return _this2._dropzone = c;
            }, onDrop: this.handleDrop }, dropzoneProps),
          content
        )
      );
    }
  }]);

  return DropzoneS3Uploader;
}(React.Component);

DropzoneS3Uploader.propTypes = {
  fileName: PropTypes.string,
  signingUrl: PropTypes.string.isRequired,
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

  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

  childrenDropzone: PropTypes.node,

  onDrop: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onFinish: PropTypes.func,

  // Passed to react-s3-uploader
  upload: PropTypes.object.isRequired,

  // Default styles for react-dropzone
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  style: PropTypes.object,
  activeStyle: PropTypes.object,
  rejectStyle: PropTypes.object
};
DropzoneS3Uploader.defaultProps = {
  upload: {},
  className: 'react-dropzone-s3-uploader',
  passChildrenProps: true,
  s3Url: '',
  isImage: function isImage(fileName) {
    return fileName && fileName.match(/\.(jpeg|jpg|gif|png|svg)/i);
  },
  notDropzoneProps: ['onFinish', 'childrenDropzone', 'containerStyle', 'placeChildrenOutsideDropArea', 'signingUrl', 'signingUrlQueryParams', 's3Url', 'fileName', 'host', 'upload', 'isImage', 'notDropzoneProps'],
  style: {
    width: 200,
    height: 200,
    border: 'dashed 2px #999',
    borderRadius: 5,
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden'
  },
  activeStyle: {
    borderStyle: 'solid',
    backgroundColor: '#eee'
  },
  rejectStyle: {
    borderStyle: 'solid',
    backgroundColor: '#ffdddd'
  }
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.componentWillMount = function () {
    return _this3.setUploaderOptions(_this3.props);
  };

  this.componentWillReceiveProps = function (props) {
    return _this3.setUploaderOptions(props);
  };

  this.setUploaderOptions = function (props) {
    _this3.setState({
      uploaderOptions: Object.assign({
        signingUrl: props.signingUrl,
        s3path: '',
        contentDisposition: 'auto',
        onFinishS3Put: _this3.handleFinish,
        onProgress: _this3.handleProgress,
        onError: _this3.handleError
      }, props.upload)
    });
  };

  this.handleProgress = function (progress, textState, file) {
    _this3.props.onProgress && _this3.props.onProgress(progress, textState, file);
    _this3.setState({ progress: progress });
  };

  this.handleError = function (err, file) {
    _this3.props.onError && _this3.props.onError(err, file);
    _this3.setState({ error: err, progress: null });
  };

  this.handleFinish = function (info, file) {
    var uploadedFile = Object.assign({
      file: file,
      fileUrl: _this3.fileUrl(_this3.props.s3Url, info.fileName || info.filename)
    }, info);

    var uploadedFiles = _this3.state.uploadedFiles;
    uploadedFiles.push(uploadedFile);

    _this3.props.onFinish && _this3.props.onFinish(uploadedFile);

    _this3.setState({ uploadedFiles: uploadedFiles, error: null, progress: null });
  };

  this.handleDrop = function (files, rejectedFiles) {
    _this3.setState({ uploadedFiles: [], error: null, progress: null });
    var options = _extends({
      files: files
    }, _this3.state.uploaderOptions);
    new S3Upload(options); // eslint-disable-line
    _this3.props.onDrop && _this3.props.onDrop(files, rejectedFiles);
  };

  this.fileUrl = function (s3Url, fileName) {
    return (s3Url.endsWith('/') ? s3Url.slice(0, -1) : s3Url) + '/' + fileName;
  };

  this.renderImage = function (_ref) {
    var uploadedFile = _ref.uploadedFile;
    return React.createElement(
      'div',
      { className: 'rdsu-image' },
      React.createElement('img', { src: uploadedFile.fileUrl })
    );
  };

  this.renderFile = function (_ref2) {
    var uploadedFile = _ref2.uploadedFile;
    return React.createElement(
      'div',
      { className: 'rdsu-file' },
      React.createElement(
        'div',
        { className: 'rdsu-file-icon' },
        React.createElement('span', { className: 'fa fa-file-o', style: { fontSize: '50px' } })
      ),
      React.createElement(
        'div',
        { className: 'rdsu-filename' },
        uploadedFile.file.name
      )
    );
  };

  this.renderProgress = function (_ref3) {
    var progress = _ref3.progress;
    return progress ? React.createElement(
      'div',
      { className: 'rdsu-progress' },
      progress
    ) : null;
  };

  this.renderError = function (_ref4) {
    var error = _ref4.error;
    return error ? React.createElement(
      'div',
      { className: 'rdsu-error small' },
      error
    ) : null;
  };
};

export default DropzoneS3Uploader;