package eu.simpaticoproject.ife.model.wf;

public class Field {
	private String id;
	private String xpath;
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
	public Mapping getMapping() {
		return mapping;
	}
	public void setMapping(Mapping mapping) {
		this.mapping = mapping;
	}

}
