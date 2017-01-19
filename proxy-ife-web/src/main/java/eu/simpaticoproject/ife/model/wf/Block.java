package eu.simpaticoproject.ife.model.wf;

import java.util.ArrayList;
import java.util.List;

public class Block {
	private String id;
	private String type;
	private String xpath;
	private List<String> tags = new ArrayList<String>();
	private List<String> fields = new ArrayList<String>();
	private List<String> blocks = new ArrayList<String>();
	private List<String> dependencies = new ArrayList<String>();
	private String condition;
	private String completed;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public List<String> getTags() {
		return tags;
	}
	public void setTags(List<String> tags) {
		this.tags = tags;
	}
	public List<String> getFields() {
		return fields;
	}
	public void setFields(List<String> fields) {
		this.fields = fields;
	}
	public List<String> getBlocks() {
		return blocks;
	}
	public void setBlocks(List<String> blocks) {
		this.blocks = blocks;
	}
	public List<String> getDependencies() {
		return dependencies;
	}
	public void setDependencies(List<String> dependencies) {
		this.dependencies = dependencies;
	}
	public String getCondition() {
		return condition;
	}
	public void setCondition(String condition) {
		this.condition = condition;
	}
	public String getCompleted() {
		return completed;
	}
	public void setCompleted(String completed) {
		this.completed = completed;
	}
	public String getXpath() {
		return xpath;
	}
	public void setXpath(String xpath) {
		this.xpath = xpath;
	}
}
