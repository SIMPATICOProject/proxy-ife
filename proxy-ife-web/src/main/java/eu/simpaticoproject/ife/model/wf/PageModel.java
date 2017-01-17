package eu.simpaticoproject.ife.model.wf;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class PageModel {
	private Map<String, String> context;
	private List<Block> blocks = new ArrayList<Block>();
	private List<Field> fields = new ArrayList<Field>();
	private List<Rule> rules = new ArrayList<Rule>();
	
	public Map<String, String> getContext() {
		return context;
	}
	public void setContext(Map<String, String> context) {
		this.context = context;
	}
	public List<Block> getBlocks() {
		return blocks;
	}
	public void setBlocks(List<Block> blocks) {
		this.blocks = blocks;
	}
	public List<Field> getFields() {
		return fields;
	}
	public void setFields(List<Field> fields) {
		this.fields = fields;
	}
	public List<Rule> getRules() {
		return rules;
	}
	public void setRules(List<Rule> rules) {
		this.rules = rules;
	}
	
	
}
