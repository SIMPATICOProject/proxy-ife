package eu.simpaticoproject.ife.model.wf;

public class Field {
	private String id;
	private String xpath;
	private String uri;
	private boolean required;
	private Mapping mapping;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getXpath() {
		return xpath;
	}
	public void setXpath(String xpath) {
		this.xpath = xpath;
	}
	public String getUri() {
		return uri;
	}
	public void setUri(String uri) {
		this.uri = uri;
	}
	public boolean isRequired() {
		return required;
	}
	public void setRequired(boolean required) {
		this.required = required;
	}
	public Mapping getMapping() {
		return mapping;
	}
	public void setMapping(Mapping mapping) {
		this.mapping = mapping;
	}

}
