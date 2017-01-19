package eu.simpaticoproject.ife.model.wf;

import java.util.ArrayList;
import java.util.List;

public class Variable {
	private String value;
	private List<String> tags = new ArrayList<String>();
	
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public List<String> getTags() {
		return tags;
	}
	public void setTags(List<String> tags) {
		this.tags = tags;
	}
}
