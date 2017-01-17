package eu.simpaticoproject.ife.model;

import java.util.ArrayList;
import java.util.List;

import eu.simpaticoproject.ife.model.wf.PageModel;

public class WorkFlowModelStore extends BaseObject {
	private String uri;
	private List<String> profileTypes = new ArrayList<String>();
	private PageModel model;
	
	public String getUri() {
		return uri;
	}
	public void setUri(String uri) {
		this.uri = uri;
	}
	public List<String> getProfileTypes() {
		return profileTypes;
	}
	public void setProfileTypes(List<String> profileTypes) {
		this.profileTypes = profileTypes;
	}
	public PageModel getModel() {
		return model;
	}
	public void setModel(PageModel model) {
		this.model = model;
	}
}
