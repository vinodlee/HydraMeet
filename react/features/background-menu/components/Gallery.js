import React from "react";
import PropTypes from "prop-types";
import { VideoBlurButtonC } from '../../blur';
import './FeedbackDialog.module.css';

/**
 * Given a DOM element, searches it for <img> tags and checks if all of them
 * have finished loading or not.
 * @param  {Element} parentNode
 * @return {Boolean}
 */
function imagesLoaded(parentNode) {
    const imgElements = [...parentNode.querySelectorAll("img")];
    for (let i = 0; i < imgElements.length; i += 1) {
        const img = imgElements[i];
        if (!img.complete) {
            return false;
        }
    }
    return true;
}

class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            ImagePath: '',
            file: '',
            imagePreviewUrl: ''
        };
    }

    handleImageChange = () => {
        this.setState({
            loading: !imagesLoaded(this.galleryElement)
        });
    };

    handleImageClick = (e) => {
        this.setState({
            ImagePath: e.target.name
        });
    };

    renderSpinner() {
        if (!this.state.loading) {
            return null;
        }
        return <span className="spinner" />;
    }

    renderImage(imageUrl) {
        return (
            <div key={imageUrl} style={{ float: 'left', padding: '5px', cursor: 'pointer' }}>
                <span className="BGimgButton">
                    <img
                        src={imageUrl}
                        name={imageUrl}
                        onLoad={this.handleImageChange}
                        onError={this.handleImageChange}
                        onClick={this.handleImageClick}
                        alt={imageUrl}
                        style={{ width: '165px', height: "110px" }}
                    />
                </span>
            </div>
        );
    }

    _handleSubmit(e) {
        e.preventDefault();
        // TODO: do something with -> this.state.file
        console.log('handle uploading-', this.state.file);
    }

    _handleImageChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result
            });
        }

        reader.readAsDataURL(file)
    }

    render() {

        let { imagePreviewUrl } = this.state;
        let $imagePreview = null;
        if (imagePreviewUrl) {
            $imagePreview = (<span className="BGimgButton"><img src={imagePreviewUrl} alt={imagePreviewUrl} name={imagePreviewUrl} onClick={this.handleImageClick} /></span>);
        } else {
            $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
        }


        return (
            <div
                className="gallery"
                ref={element => {
                    this.galleryElement = element;
                }}
                style={{ position: 'relative' }}
            >
                {this.renderSpinner()}
                <div className="images" style={{ textAlign: 'center' }}>
                    {this.props.imageUrls.map(imageUrl => this.renderImage(imageUrl))}
                </div>

                {imagePreviewUrl == '' ? <span></span> :
                    <div className='imgPreview' onClick={this.handleImageClick} style={{ position: 'relative', float: 'left', cursor: 'pointer' }}>
                        {$imagePreview}
                    </div>}


                <div className="previewComponent">
                    <form onSubmit={(e) => this._handleSubmit(e)}>
                        <input className="fileInput"
                            type="file"
                            onChange={(e) => this._handleImageChange(e)} />

                    </form>

                </div>

                <VideoBlurButtonC
                    key='videobackgroundblur'
                    showLabel={true}
                    visible={true}
                    ImagePath={this.state.ImagePath}
                />

            </div>
        );
    }
}
Gallery.propTypes = {
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired
};
export default Gallery;
